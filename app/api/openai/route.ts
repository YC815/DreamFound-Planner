import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    console.log('接收到的 prompt:', prompt);

    const assistant = await openai.beta.assistants.create({
      name: "夢想基金創造工具",
      model: "gpt-4-1106-preview", // 更正模型名稱
      instructions: "你是夢想基金創造者。我將會給你 1. 夢想名字 2. 每月收入 3. 每月支出 4. 現有夢想基金 5. 每月願意付出金額 6. 夢想基金目標金額。請幫我輸出：1. 需要多久才能存到目標金額（如果需要3個月就輸出「!!3!!」，不需要任何開頭、尾巴詞） 2. 這筆夢想基金預計可以買什麼去圓夢？（以列點式，不需要開頭尾巴詞，輸出「@@iPad、Apple Pencil、筆記本、水杯@@」這樣） 3. 關於此夢想和金額規劃的評語。（不需要開頭尾巴詞，輸出「##{評語}##」）",
    });

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    await checkStatus(thread.id, run.id);
    const messages = await openai.beta.threads.messages.list(thread.id);

    console.log('API 響應:', JSON.stringify(messages, null, 2));

    if (messages.data && messages.data.length > 0) {
      const latestMessage = messages.data[0]; // 獲取最新的消息
      if (latestMessage.content && latestMessage.content.length > 0) {
        const textContent = latestMessage.content.find(item => item.type === 'text');
        if (textContent && textContent.text) {
          return NextResponse.json({ result: textContent.text.value });
        }
      }
    }

    return NextResponse.json({ error: "未能生成有效的回應" });

  } catch (error) {
    console.error('API 請求錯誤:', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return NextResponse.json({ error: "API 請求失敗，具體錯誤: " + errorMessage }, { status: 500 });
  }
}

async function checkStatus(threadId: string, runId: string) {
  let isCompleted = false;
  while (!isCompleted) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runStatus.status === 'completed') {
      isCompleted = true;
    } else if (runStatus.status === 'failed') {
      throw new Error('Run failed: ' + runStatus.last_error?.message);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}