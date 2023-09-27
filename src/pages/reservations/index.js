// Mui
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';

// Hooks
import { useState } from 'react';
import { useRouter } from 'next/router';

// Components
import Calendar from '@/components/Calendar';
import HorizontalProfessorCard from './components/HorizontalProfessorCard';

// Utils
import { order_and_group } from '@/utils/order_and_group';

export default function Reservation() {
    const router = useRouter();
    const subjects = router.query.subject.split('-');
    const professor = {
        name: router.query.name,
        phone: router.query.phone,
        email: router.query.email,
        office: router.query.office,
    };

    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [subject, setSubject] = useState(subjects[0]);
    const [showConfirmReservation, setShowConfirmationReservation] = useState(false);

    const handleCancel = () => {
        setSelectedBlocks([]);
        setShowConfirmationReservation(false);
    };

    const handleReserve = () => {
        let adaptedReservation = selectedBlocks.map(block => {
            const time = block.time.trim();
            return {
                day: block.day,
                startTime: time.split('-')[0],
                endTime: time.split('-')[1],
            };
        });
        handleCancel();
        console.log(adaptedReservation);
    };

    const handleSubjectChange = e => {
        setSelectedBlocks([]);
        setSubject(e.target.value);
    };

    const handleConfirmationOpen = () => {
        let orderedSelectedBlocks = order_and_group(selectedBlocks);
        setSelectedBlocks(orderedSelectedBlocks);
        setShowConfirmationReservation(true);
    };

    return (
        <>
            <div style={{ display: 'flex', width: '90%', margin: '2rem auto', alignItems: 'end', justifyContent: 'space-between' }}>
                <HorizontalProfessorCard professor={professor} />

                <FormControl sx={{ minWidth: 150, backgroundColor: '#fff' }}>
                    <InputLabel>Subject</InputLabel>
                    <Select value={subject} label='Subject' onChange={e => handleSubjectChange(e)}>
                        {subjects.map(subject => (
                            <MenuItem value={subject} key={subject}>
                                {subject}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <Calendar selectedBlocks={selectedBlocks} setSelectedBlocks={setSelectedBlocks} />

            <div style={{ display: 'flex', justifyContent: 'right', margin: '1rem auto', width: '90%' }}>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button variant='contained' onClick={handleConfirmationOpen} disabled={selectedBlocks.length === 0}>
                    Reserve
                </Button>
            </div>

            <Dialog open={showConfirmReservation}>
                <DialogTitle>Confirm Reservation</DialogTitle>
                <DialogContent dividers>
                    <div style={{ display: 'flex' }}>
                        <div style={{ paddingInline: '2rem' }}>
                            {selectedBlocks.map(block => (
                                <Typography key={block.time + block.day}>{block.day + ' ' + block.time}</Typography>
                            ))}
                        </div>
                        <Divider orientation='vertical' flexItem />
                        <div style={{ paddingInline: '2rem' }}>
                            <Typography>{`Subject: ${subject}`}</Typography>
                            <Typography>{`Price per hour: $${professor.price}`}</Typography>
                            <Typography>{`Total: $${(professor.price * selectedBlocks.length) / 2}`}</Typography>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button variant='contained' onClick={handleReserve}>
                        Reserve
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
