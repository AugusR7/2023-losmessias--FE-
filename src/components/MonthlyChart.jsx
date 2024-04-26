import dynamic from 'next/dynamic';
const Pie = dynamic(() => import('@ant-design/plots').then(({ Pie }) => Pie), { ssr: false });
import { Box, CircularProgress, Typography } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import { getColor } from '@/utils/getColor';
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetcherGetWithTokenDashboard } from '@/helpers/FetchHelpers';
import useWindowSize from '@/hooks/useWindowSize';

export default function MonthlyChart({ id, legend = false }) {
    const user = useUser();
    const [configDonut, setConfigDonut] = useState(null);
    const windowSize = useWindowSize();

    const { data, isLoading } = useSWR(
        [`${process.env.NEXT_PUBLIC_API_URI}/api/reservation/getStatistics?professorId=${id}`, user.token],
        fetcherGetWithTokenDashboard,
        { fallbackData: [] }
    );

    useEffect(() => {
        if (data.length > 0) {
            const colors = data[2]?.classes.map(val => {
                if (val.type !== 'Cancelled') return getColor(val.type);

                return '#ADB5BD';
            });
            setConfigDonut({
                appendPadding: 10,
                data: data[2].classes,
                angleField: 'value',
                colorField: 'type',
                radius: 1,
                innerRadius: 0.55,
                legend: {
                    legend: true,
                    position: 'bottom',
                },
                width: 300,
                color: colors,
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
        <>
            {isLoading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <CircularProgress />
                    <Typography variant='h5' sx={{ marginBottom: '0.5rem', marginTop: '1rem', textAlign: 'center', marginLeft: '0.5rem' }}>
                        Loading...
                    </Typography>
                </Box>
            ) : (
                <>
                    {configDonut && (
                        <div style={{ justifyContent: 'center', display: 'flex', justifySelf: 'center' }}>
                            <Pie {...configDonut} />
                        </div>
                    )}
                    {data.length === 0 ? (
                        <>
                            <Typography variant='h5' sx={{ marginBottom: '0.5rem', marginTop: '1rem', textAlign: 'center' }}>
                                There are no classes to show yet
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant='h5' sx={{ marginBottom: '0.5rem', marginTop: '1rem', textAlign: 'center' }}>
                                Income
                            </Typography>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                                <PaidIcon sx={{ fontSize: 30 }} />
                                <Typography variant='h6'>{data[2]?.income.toFixed(2)}</Typography>
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
}
