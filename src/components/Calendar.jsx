// Mui
import { Typography } from '@mui/material';

// Utils
import { compare_time, first_block, parseDate } from '@/utils/compareDate';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/router';

const blocks = [
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '11:30 - 12:00',
    '12:00 - 12:30',
    '12:30 - 13:00',
    '13:00 - 13:30',
    '13:30 - 14:00',
    '14:00 - 14:30',
    '14:30 - 15:00',
    '15:00 - 15:30',
    '15:30 - 16:00',
    '16:00 - 16:30',
    '16:30 - 17:00',
    '17:00 - 17:30',
    '17:30 - 18:00',
    '18:00 - 18:30',
    '18:30 - 19:00',
    '19:00 - 19:30',
    '19:30 - 20:00',
    '20:00 - 20:30',
    '20:30 - 21:00',
    '21:00 - 21:30',
    '21:30 - 22:00',
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const daysNumber = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
};

const styles = {
    block: {
        borderBlock: '1px solid #f0f0f0',
        cursor: 'pointer',
    },
    selected: {
        borderBlock: '1px solid #338aed70',
        backgroundColor: '#338aed90',
        cursor: 'pointer',
    },
    disabled: {
        borderBlock: '1px solid #adadad70',
        backgroundColor: '#adadad90',
    },
    reserved: {
        borderBlock: '1px solid #e64b4b70',
        backgroundColor: '#e64b4b90',
    },
};

export default function Calendar({ selectedBlocks, setSelectedBlocks, disabledBlocks, week, interactive = true, showData = false }) {
    var curr_date = new Date();
    var first = curr_date.getDate() - curr_date.getDay();
    const user = useUser();
    const router = useRouter();

    const handleBlockSelection = (block, day) => {
        if (!block_disabled(block, day)) {
            if (selectedBlocks.find(element => element.time === block && element.day === day) !== undefined) {
                setSelectedBlocks(prevBlocks =>
                    prevBlocks.filter(element => {
                        if (element.time === block && element.day === day) return false;
                        return true;
                    })
                );
            } else {
                setSelectedBlocks(prevBlocks => [...prevBlocks, { day, time: block }]);
            }
        } else {
            let { id, otherUserId } = redirect_to_reservation(showData, block, day);

            if (id !== undefined) router.push('reservation?id=' + id + '&userId=' + otherUserId);
        }
    };

    const active = (block, day) => {
        let exists = selectedBlocks.find(element => element.time === block && element.day === day);
        return exists !== undefined;
    };

    const block_disabled = (block, day) => {
        if (day_disabled(day, block) || block_reserved(block, day) || block_not_available(block, day)) return true;
        return false;
    };

    const block_reserved = (block, day) => {
        const blockDate = new Date(new Date().setDate(first + daysNumber[day] + 7 * week)).toISOString().split('T')[0];
        const blockDisabled = disabledBlocks.find(
            blk => blockDate === blk.day.join('-') && blk.status === 'CONFIRMED' && compare_time(block, blk)
        );

        if (blockDisabled) return true;
        return false;
    };

    const block_not_available = (block, day) => {
        const blockDate = new Date(new Date().setDate(first + daysNumber[day] + 7 * week)).toISOString().split('T')[0];
        const blockDisabled = disabledBlocks.find(
            blk => blockDate === blk.day.join('-') && blk.status === 'NOT_AVAILABLE' && compare_time(block, blk)
        );

        if (blockDisabled) return true;
        return false;
    };

    const show_data = (flag, block, day) => {
        if (flag) {
            const blockDate = new Date(new Date().setDate(first + daysNumber[day] + 7 * week)).toISOString().split('T')[0];
            const blockDisabled = disabledBlocks.findIndex(
                blk => blockDate === blk.day.join('-') && blk.status === 'CONFIRMED' && first_block(block, blk)
            );
            if (blockDisabled !== -1) {
                let name =
                    user.role === 'student'
                        ? disabledBlocks[blockDisabled].professor.firstName + ' ' + disabledBlocks[blockDisabled].professor.lastName
                        : disabledBlocks[blockDisabled].student.firstName + ' ' + disabledBlocks[blockDisabled].student.lastName;

                return {
                    id: disabledBlocks[blockDisabled].id,
                    subject: disabledBlocks[blockDisabled].subject.name,
                    name,
                };
            }
        }
    };

    const redirect_to_reservation = (flag, block, day) => {
        if (flag) {
            const blockDate = new Date(new Date().setDate(first + daysNumber[day] + 7 * week)).toISOString().split('T')[0];
            const blockDisabled = disabledBlocks.findIndex(
                blk => blockDate === blk.day.join('-') && blk.status === 'CONFIRMED' && compare_time(block, blk)
            );
            if (blockDisabled !== -1) {
                return {
                    id: disabledBlocks[blockDisabled].id,
                    otherUserId:
                        user.role.toLowerCase() === 'student'
                            ? disabledBlocks[blockDisabled].professor.id
                            : disabledBlocks[blockDisabled].student.id,
                };
            }
        }
    };

    const day_disabled = (day, block) => {
        if (week === 0 && curr_date.getDay() > daysNumber[day]) {
            return true;
        } else if (
            week === 0 &&
            curr_date.getDay() === daysNumber[day] &&
            curr_date.getHours() > parseInt(block.split('-')[0].split(':')[0])
        )
            return true;

        return false;
    };

    const style_of_block = (block, day) => {
        let style = interactive ? styles.block : { ...styles.block, cursor: 'default' };

        if (active(block, day)) style = styles.selected;
        else if (day_disabled(day, block)) style = styles.disabled;
        else if (block_reserved(block, day)) style = showData ? { ...styles.reserved, cursor: 'pointer' } : styles.reserved;
        else if (block_not_available(block, day)) style = styles.disabled;

        return style;
    };

    return (
        <>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead style={{ height: '3rem', backgroundColor: '#fafafa' }}>
                    <tr>
                        <th style={{ borderBottom: '1px solid #f0f0f0', width: '10%' }}></th>
                        {days.map(day => (
                            <th style={{ borderBottom: '1px solid #f0f0f0' }} key={day}>
                                <Typography variant='h6'>{day}</Typography>
                                <Typography>{parseDate(new Date(new Date().setDate(first + daysNumber[day] + 7 * week)))}</Typography>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody style={{ backgroundColor: '#fff' }}>
                    {blocks.map(block => (
                        <tr key={block} style={{ height: '2.3rem' }}>
                            <td style={{ borderBlock: '1px solid #f0f0f0', textAlign: 'center' }}>
                                <Typography variant='body1'>{block}</Typography>
                            </td>

                            {days.map(day => {
                                const data = show_data(showData, block, day);

                                return (
                                    <td style={style_of_block(block, day)} onClick={() => handleBlockSelection(block, day)} key={day}>
                                        <Typography fontSize={14} align='center'>
                                            {data?.subject}
                                        </Typography>
                                        <Typography fontSize={14} align='center'>
                                            {data?.name}
                                        </Typography>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}