// Mui
import dynamic from 'next/dynamic';
const Pie = dynamic(() => import('@ant-design/plots').then(({ Pie }) => Pie), { ssr: false });
import { Box, Card, CircularProgress, Typography } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PaidIcon from '@mui/icons-material/Paid';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Utils
import { getColor } from '@/utils/getColor';
import MonthlyChart from './MonthlyChart';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import useSWR from 'swr';
import { fetcherGetWithTokenDashboard } from '@/helpers/FetchHelpers';
import useWindowSize from '@/hooks/useWindowSize';

export default function Dashboard({ id }) {
    const user = useUser();
    const [colors, setColors] = useState([]);
    const [totalPercentage, setTotalPercentage] = useState('');
    const [incomePercentage, setIncomePercentage] = useState('');
    const [config, setConfig] = useState(null);
    const [configDonut, setConfigDonut] = useState(null);
    const windowSize = useWindowSize();

    const { data, isLoading } = useSWR(
        [`${process.env.NEXT_PUBLIC_API_URI}/api/reservation/getStatistics?professorId=${id}`, user.token],
        fetcherGetWithTokenDashboard,
        { fallbackData: [] }
    );

    useEffect(() => {
        if (data.length > 0) {
            const colors = data[0]?.classes.map(val => {
                if (val.type !== 'Cancelled') return getColor(val.type);
                return '#ADB5BD';
            });

            const colors2 = data[2]?.classes.map(val => {
                if (val.type !== 'Cancelled') return getColor(val.type);
                return '#ADB5BD';
            });

            setColors(colors);
            setTotalPercentage(data[0]?.total - data[1]?.total);
            setIncomePercentage(data[1].income > 0 ? data[0]?.income / data[1]?.income - 1 : 0);

            setConfig({
                appendPadding: 10,
                data: data[0]?.classes,
                angleField: 'value',
                colorField: 'type',
                radius: 0.8,
                color: colors,
                legend: {
                    position: 'bottom',
                },
                label: {
                    type: 'inner',
                    offset: '-30%',
                    content: '{percentage}',
                    style: {
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 'bold',
                        fill: 'black',
                    },
                },
                interactions: [
                    {
                        type: 'pie-legend-active',
                    },
                    {
                        type: 'element-active',
                    },
                ],
            });
            setConfigDonut({
                appendPadding: 10,
                data: data[2].classes,
                angleField: 'value',
                colorField: 'type',
                radius: 1,
                innerRadius: 0.55,
                legend: false,
                color: colors2,
                label: {
                    type: 'inner',
                    offset: '-50%',
                    content: '{percentage}',
                    style: {
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 'bold',
                        fill: 'black',
                    },
                },
                interactions: [
                    {
                        type: 'element-selected',
                    },
                    {
                        type: 'element-active',
                    },
                ],
                statistic: {
                    title: false,
                    content: {
                        customHtml: () => <Typography variant='h4'>{data[2].total.toFixed(2)}</Typography>,
                        style: {
                            whiteSpace: 'pre-wrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        },
                    },
                },
            });
        }
    }, [data]);

    return (
        <div style={windowSize.width > 500 ? { display: 'flex', gap: 10 } : { display: 'flex', gap: 10, flexDirection: 'column' }}>
            <Card
                sx={
                    windowSize.width > 500
                        ? { width: '65%', textAlign: 'center', padding: '1rem' }
                        : { textAlign: 'center', padding: '1rem' }
                }
            >
                <Typography variant='h5'>Current Month</Typography>
                <div style={windowSize.width > 500 ? { display: 'flex' } : {}}>
                    <div style={windowSize.width > 500 ? { width: '70%' } : { width: '100%' }}>
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                }}
                            >
                                <CircularProgress sx={{ mr: 2 }} />
                                <Typography variant='h5' sx={{ marginBottom: '0.5rem', marginTop: '1rem', textAlign: 'center' }}>
                                    Loading...
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {data.length > 0 ? (
                                    <>{config && <Pie {...config} />}</>
                                ) : (
                                    <>
                                        <Typography variant='h5' sx={{ marginBottom: '0.5rem', marginTop: '3.5rem', textAlign: 'center' }}>
                                            No metrics to be displayed, yet!
                                        </Typography>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div
                        style={
                            windowSize.width > 500
                                ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }
                                : {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    gap: 20,
                                    alignItems: 'center',
                                    marginTop: '1rem',
                                }
                        }
                    >
                        <div>
                            <Typography variant='h5' sx={{ marginBottom: '0.5rem' }}>
                                Total
                            </Typography>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <BookmarkIcon sx={{ fontSize: 30 }} />
                                <Typography variant='h6'>{data[0]?.total}</Typography>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {totalPercentage < 0 && <ArrowDropDownIcon color='error' sx={{ fontSize: 34 }} />}
                                    {totalPercentage > 0 && <ArrowDropUpIcon color='success' sx={{ fontSize: 34 }} />}
                                    {totalPercentage !== 0 && (
                                        <Typography variant='h6' sx={{ fontSize: 16, color: totalPercentage > 0 ? 'green' : 'red' }}>
                                            {totalPercentage}
                                        </Typography>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Typography variant='h5' sx={{ marginBottom: '0.5rem' }}>
                                Income
                            </Typography>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <PaidIcon sx={{ fontSize: 30 }} />
                                <Typography variant='h6'>{data[0]?.income}</Typography>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {incomePercentage < 0 && (
                                        <>
                                            <ArrowDropDownIcon color='error' sx={{ fontSize: 34 }} />
                                            <Typography variant='h6' sx={{ fontSize: 16, color: 'red' }}>
                                                {(incomePercentage * 100).toFixed(2) + '%'}
                                            </Typography>
                                        </>
                                    )}
                                    {incomePercentage > 0 && (
                                        <>
                                            <ArrowDropUpIcon color='success' sx={{ fontSize: 34 }} />
                                            <Typography variant='h6' sx={{ fontSize: 16, color: 'green' }}>
                                                {(incomePercentage * 100).toFixed(2) + '%'}
                                            </Typography>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card
                style={
                    windowSize.width > 500
                        ? { width: '40%', textAlign: 'center', display: 'flex', flexDirection: 'column', padding: '1rem' }
                        : { textAlign: 'center', padding: '1rem' }
                }
            >
                <Typography variant='h5'>Monthly Mean</Typography>
                <div style={{ justifyContent: 'center', display: 'flex' }}>
                    {isLoading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignContent: 'center',
                            }}
                        >
                            <CircularProgress sx={{ mr: 2 }} />
                            <Typography variant='h5' sx={{ marginBottom: '4rem', marginTop: '1rem', textAlign: 'center' }}>
                                Loading...
                            </Typography>
                        </Box>
                    ) : (
                        <>{configDonut && <Pie {...configDonut} style={windowSize.width > 500 ? { width: '68%' } : { width: '100%' }} />}</>
                    )}
                </div>
                <Typography variant='h5' sx={{ marginBottom: '0.5rem', marginTop: '1rem', textAlign: 'center' }}>
                    Income
                </Typography>
                {data.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            <PaidIcon sx={{ fontSize: 30 }} />
                            <Typography variant='h6'>{data[2]?.income.toFixed(2)}</Typography>
                        </div>
                    </>
                ) : (
                    <>
                        <Typography variant='h5' sx={{ marginBottom: '0.5rem', marginTop: '2.5rem', textAlign: 'center' }}>
                            No metrics to be displayed, yet!
                        </Typography>
                    </>
                )}
            </Card>
        </div>
    );
}
