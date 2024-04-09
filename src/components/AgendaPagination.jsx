import useWindowSize from '@/hooks/useWindowSize';
import { parseDateToDisplay } from '@/utils/compareDate';
import { Button, Typography } from '@mui/material';

export default function AgendaPagination({ week, setWeek, day, setDay, setSelectedBlocks, monthDay, month, year, setMonthDay, setMonth, setYear }) {
    const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
    
    const addWeeks = (date, weeks) => {
        date.setDate(date.getDate() + 7 * weeks);
        return date;
    }
    
    const handleWeekChangeFromPagination = (direction) => {
        const isRightDirection = direction === 'right';
        const isMonthEnd = monthDay === daysInMonth(year, month);
        const isMonthStart = monthDay === 1;
        const isYearEnd = month === 12;
        const isYearStart = month === 1;

        const newYear = isRightDirection ? year + 1 : year - 1;
        const newMonth = isRightDirection ? 1 : 12;
        const newMonthDay = isRightDirection ? 1 : daysInMonth(year, month - 1);

        if (isRightDirection && isMonthEnd) {
            setYear(isYearEnd ? newYear : year);
            setMonth(isYearEnd ? newMonth : month + 1);
            setMonthDay(newMonthDay);
        } else if (!isRightDirection && isMonthStart) {
            setYear(isYearStart ? newYear : year);
            setMonth(isYearStart ? newMonth : month - 1);
            setMonthDay(newMonthDay);
        } else {
            setMonthDay(monthDay + (isRightDirection ? 1 : -1));
        }
    }

    const curr_date = new Date();
    const aux_date = new Date();
    const firstDayOfTheWeek = curr_date.getDate() - curr_date.getDay();
    
    var mondayReference = new Date(aux_date.setDate(firstDayOfTheWeek+1 + 7 * week));
    var mondayDate = mondayReference.toISOString().split('T')[0]

    var sundayReference = new Date(mondayReference.setDate(mondayReference.getDate() - 1))
    var sundayDate = addWeeks(sundayReference, 1).toISOString().split('T')[0]
    
    const windowSize = useWindowSize();


    const handlePagination = direction => {
        setSelectedBlocks([]);
        if (direction === 'right') {
            setWeek(prevWeek => prevWeek + 1);
        } else {
            setWeek(prevWeek => prevWeek - 1);
        }
        handleWeekChangeFromPagination(direction);
    };

    const handlePaginationMobile = direction => {
        setSelectedBlocks([]);

        if (direction === 'right') {
            if (day === 7) {
                setWeek(prevWeek => prevWeek + 1);
                setDay(1);
            } else setDay(prev => prev + 1)
        } else {
            if (day === 1) {
                setWeek(prevWeek => prevWeek - 1);
                setDay(7);
            } else setDay(prev => prev - 1)
        }
        handleWeekChangeFromPagination(direction);
    };

    return (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginBlock: 10, alignItems: 'center' }}>
            {windowSize.width > 500 && (
                <>
                    <Button variant='outlined' disabled={week === 0} onClick={() => handlePagination('left')}>
                        {'<'}
                    </Button>
                    <Typography>
                        {parseDateToDisplay(
                            parseInt(mondayDate.split('-')[2]),
                            parseInt(mondayDate.split('-')[1]),
                            parseInt(mondayDate.split('-')[0]))} - {parseDateToDisplay(
                                parseInt(sundayDate.split('-')[2]),
                                parseInt(sundayDate.split('-')[1]),
                                parseInt(sundayDate.split('-')[0]))}
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
                    <Typography>
                        {parseDateToDisplay(monthDay, month, year)}
                    </Typography>
                    <Button variant='outlined' onClick={() => handlePaginationMobile('right')}>
                        {'>'}
                    </Button>
                </>
            )}
        </div>
    );
}
