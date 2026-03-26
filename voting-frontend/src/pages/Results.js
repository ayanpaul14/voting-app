import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend
} from 'chart.js';
import API from '../api/axios';
import './Results.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COLORS = ['#e94560', '#0f9b8e', '#f1c40f', '#9b59b6', '#3498db', '#e67e22'];

const Results = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await API.get('/candidate/vote/count');
                setResults(data);
            } catch (err) {
                setError('Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading) return <div className="page-loading">Loading results...</div>;
    if (error) return <div className="results-error">{error}</div>;

    const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);
    const leader = results[0];

    const chartData = {
        labels: results.map(r => r.name),
        datasets: [{
            label: 'Votes',
            data: results.map(r => r.voteCount),
            backgroundColor: results.map((_, i) => COLORS[i % COLORS.length]),
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${ctx.raw} votes`
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#aaa' },
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
                ticks: { color: '#aaa', stepSize: 1 },
                grid: { color: 'rgba(255,255,255,0.05)' },
                beginAtZero: true
            }
        }
    };

    return (
        <div className="results-container">
            <div className="results-header">
                <h2>Live Results</h2>
                <p>{totalVotes} total votes cast</p>
            </div>

            {leader && totalVotes > 0 && (
                <div className="leader-banner">
                    <span className="leader-label">Currently Leading</span>
                    <span className="leader-name">{leader.name}</span>
                    <span className="leader-party">{leader.party}</span>
                    <span className="leader-votes">{leader.voteCount} votes</span>
                </div>
            )}

            <div className="chart-card">
                <Bar data={chartData} options={chartOptions} />
            </div>

            <div className="results-table">
                <div className="results-table-header">
                    <span>Rank</span>
                    <span>Candidate</span>
                    <span>Party</span>
                    <span>Votes</span>
                    <span>Share</span>
                </div>
                {results.map((r, i) => (
                    <div className="results-table-row" key={i}>
                        <span className="rank">#{i + 1}</span>
                        <span className="result-name">{r.name}</span>
                        <span className="result-party">{r.party}</span>
                        <span className="result-votes">{r.voteCount}</span>
                        <span className="result-share">
                            {totalVotes > 0
                                ? ((r.voteCount / totalVotes) * 100).toFixed(1)
                                : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Results;