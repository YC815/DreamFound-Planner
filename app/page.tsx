"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

const Home: React.FC = () => {
    const [dreamName, setDreamName] = useState<string>('');
    const [income, setIncome] = useState<string>('');
    const [expenses, setExpenses] = useState<string>('');
    const [savings, setSavings] = useState<string>('');
    const [monthlyContribution, setMonthlyContribution] = useState<string>('');
    const [goalAmount, setGoalAmount] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [parsedResult, setParsedResult] = useState({
        time: '',
        items: '',
        comment: ''
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingDots, setLoadingDots] = useState<string>('');
    const [contentHeight, setContentHeight] = useState('100vh'); // 新增的動態高度 state

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingDots(prev => {
                    const dots = ['.', '..', '...'];
                    const currentIndex = dots.indexOf(prev);
                    return dots[(currentIndex + 1) % dots.length];
                });
            }, 500);
        } else {
            setLoadingDots('');
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    // 動態調整頁面高度
    useEffect(() => {
        const updateHeight = () => {
            const bodyHeight = document.body.scrollHeight;
            setContentHeight(`${bodyHeight}px`);
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);

        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    const calculatePlan = async (): Promise<void> => {
        console.log("計算計劃開始");
        setIsLoading(true);
        setResult('');
        setParsedResult({ time: '', items: '', comment: '' });
    
        const incomeNum = Number(income);
        const expensesNum = Number(expenses);
        const savingsNum = Number(savings);
        const goalAmountNum = Number(goalAmount);
    
        console.log(`每月收入: ${incomeNum}, 每月支出: ${expensesNum}, 現有夢想基金: ${savingsNum}, 每月願意付出的金額: ${monthlyContribution}, 夢想基金目標金額: ${goalAmountNum}`);
    
        const monthlySavings = incomeNum - expensesNum;
        if (monthlySavings <= 0) {
            console.log("收入不足以覆蓋支出");
            setResult('您的收入不足以覆蓋支出，請重新檢查！');
            setIsLoading(false);
            return;
        }
    
        const prompt = `夢想名字：${dreamName} 每月收入：${incomeNum} 元 每月支出：${expensesNum} 元 現有夢想基金：${savingsNum} 元 每月願意付出金額：${monthlyContribution} 元 夢想基金目標金額：${goalAmountNum} 元`;
        console.log(`構建請求數據: ${prompt}`);
    
        try {
            console.log("發送請求到 OpenAI API");
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
        
            console.log("接收回應");
            const data = await response.json();
            console.log('API 回應:', data);
            if (data.result) {
                console.log("生成的回應: ", data.result);
                parseResult(data.result);
            } else {
                console.log("未能生成有效的回應");
                setResult('未能生成有效的回應，請稍後再試！');
            }
        } catch (error) {
            console.error("計算過程中發生錯誤:", error);
            setResult('計算失敗，請稍後再試！');
        } finally {
            setIsLoading(false);
        }
    
        console.log("計算計劃結束");
    };

    const parseResult = (text: string) => {
        const monthsMatch = text.match(/!!(\d+)!!/);
        const itemsMatch = text.match(/@@(.+?)@@/);
        const commentMatch = text.match(/##(.+?)##/);

        let timeString = '';
        if (monthsMatch) {
            const months = parseInt(monthsMatch[1]);
            if (months < 12) {
                timeString = `${months}個月`;
            } else {
                const years = Math.floor(months / 12);
                const remainingMonths = months % 12;
                timeString = years + '年' + (remainingMonths > 0 ? remainingMonths + '個月' : '');
            }
        }

        setParsedResult({
            time: timeString,
            items: itemsMatch ? itemsMatch[1] : '',
            comment: commentMatch ? commentMatch[1] : ''
        });
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: contentHeight, backgroundColor: "rgb(209 213 219)" }}>
            <div className="bg-gray-300 p-10">
                <div className="bg-white rounded-lg shadow-lg p-8 w-96 text-center flex flex-col space-y-4 mt-10">
                    <h1 className="text-2xl font-bold text-black">夢想基金創造工具</h1>
                    <div className="text-black border rounded p-4">
                        <h2 className="text-xl mb-2">夢想名字</h2>
                        <label className="block mb-2">
                            <input
                                type="text"
                                className="border rounded w-full p-2 text-black text-center"
                                value={dreamName}
                                onChange={(e) => setDreamName(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="text-black border rounded p-4">
                        <h2 className="text-xl mb-2">財務狀況</h2>
                        <label className="block mb-2">
                            每月收入
                            <input
                                type="number"
                                className="border rounded w-full p-2 text-black text-center"
                                value={income}
                                onChange={(e) => setIncome(e.target.value)}
                            />
                        </label>
                        <label className="block mb-2">
                            每月支出
                            <input
                                type="number"
                                className="border rounded w-full p-2 text-black text-center"
                                value={expenses}
                                onChange={(e) => setExpenses(e.target.value)}
                            />
                        </label>
                        <label className='block mb-2'>
                            現有夢想基金
                            <input
                                type="number"
                                className="border rounded w-full p-2 text-black text-center"
                                value={savings}
                                onChange={(e) => setSavings(e.target.value)}
                            />
                        </label>
                        <label className='block mb-2'>
                            每月願意付出的金額
                            <input
                                type="number"
                                className="border rounded w-full p-2 text-black text-center"
                                value={monthlyContribution}
                                onChange={(e) => setMonthlyContribution(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="text-black border rounded p-4">
                        <h2 className="text-xl mb-2">夢想基金目標</h2>
                        <label className="block mb-2">
                            夢想基金金額
                            <input
                                type="number"
                                className="border rounded w-full p-2 text-black text-center"
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(e.target.value)}
                            />
                        </label>
                    </div>

                    <Button
                        className="text-white rounded px-4 py-2"
                        onClick={calculatePlan}
                        disabled={isLoading}
                    >
                        {isLoading ? '計算中' : '計算存錢計劃'}
                    </Button>
                    <div className="mt-4 text-black">
                        {isLoading && <p className="text-xl font-bold">{loadingDots}</p>}
                        <p>{result}</p>
                        {parsedResult.time && (
                            <div className="mt-4 bg-gray-100 p-4 rounded text-left">
                                <p><strong>預計存錢時間：</strong>{parsedResult.time}</p>
                                <p><strong>可以為夢想購買的東西：</strong>{parsedResult.items}</p>
                                <p><strong>評語：</strong>{parsedResult.comment}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
