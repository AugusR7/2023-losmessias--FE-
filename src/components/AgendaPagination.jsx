import useWindowSize from '@/hooks/useWindowSize';
import { Button, Typography } from '@mui/material';

export default function AgendaPagination({ week, setWeek, day, setDay, setSelectedBlocks }) {
    const curr_date = new Date();
    const aux_date = new Date();
    const first = curr_date.getDate() - curr_date.getDay();
    var mondayDate = new Date(aux_date.setDate(first + 1 + 7 * week)).toISOString().split('T')[0];
    var sundayDate = new Date(aux_date.setDate(first + 7 + 7 * week)).toISOString().split('T')[0];
    const windowSize = useWindowSize();

    const handlePagination = direction => {
        setSelectedBlocks([]);

        if (direction === 'right') {
            setWeek(prevWeek => prevWeek + 1);
        } else {
            setWeek(prevWeek => prevWeek - 1);
        }
    };

    const handlePaginationMobile = direction => {
        setSelectedBlocks([]);

        if (direction === 'right') {
            if (day === 7) {
                setWeek(prevWeek => prevWeek + 1);
                setDay(1);
            } else setDay(prev => prev + 1);
        } else {
            if (day === 1) {
                setWeek(prevWeek => prevWeek - 1);
                setDay(7);
            } else setDay(prev => prev - 1);
        }
    };

    return (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginBlock: 10, alignItems: 'center' }}>
            {windowSize.width > 500 && (
                <>
                    <Button variant='outlined' disabled={week === 0} onClick={() => handlePagination('left')}>
                        {'<'}
                    </Button>
                    <Typography>
                        {mondayDate} - {sundayDate}
                    </Typography>

                    <Button variant='outlined' onClick={() => handlePagination('right')}>
                        {'>'}
                    </Button>
                </>
            )}
            {windowSize.width <= 500 && (
                <>
                    <Button variant='outlined' disabled={week === 0 && day === 1} onClick={() => handlePaginationMobile('left')}>
                        {'<'}
                    </Button>
                    <Typography>{new Date(aux_date.setDate(first + day + 7 * week)).toISOString().split('T')[0]}</Typography>
                    <Button variant='outlined' onClick={() => handlePaginationMobile('right')}>
                        {'>'}
                    </Button>
                </>
            )}
        </div>
    );
}
