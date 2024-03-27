// Components
import ProfessorCard from '@/components/cards/ProfessorCard';

// Hooks
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import useSWR from 'swr';

// Utils
import { getColor } from '@/utils/getColor';
import { fetcherGetWithToken } from '@/helpers/FetchHelpers';

// Mui
import {
    Grid,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Rating,
    Select,
    Tooltip,
    Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useRouter } from 'next/router';

export default function Professors() {
    const [professors, setProfessors] = useState([]);
    const [locationSelected, setLocationSelected] = useState([]);
    const [subjectSelected, setSubjectSelected] = useState([]);
    const [feedback, setFeedback] = useState({ rating: 0, time: 0, material: 0, kind: 0 });
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const user = useUser();
    const router = useRouter();

    const { data, isLoading } = useSWR([`${process.env.NEXT_PUBLIC_API_URI}/api/professor/all`, user.token], fetcherGetWithToken, {
        fallbackData: [],
    });
    const { data: subjects } = useSWR([`${process.env.NEXT_PUBLIC_API_URI}/api/subject/all`, user.token], fetcherGetWithToken, {
        fallbackData: [],
    });



    useEffect(() => {
        if (router.isReady) {
            console.log(user)
            if (user.id) {
                if (user.role == 'professor') router.push('/professor-landing');
                if (user.role === 'admin') router.push('/admin-landing');
                const requestOptions = {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/student/${user.id}`, requestOptions).then(res => {
                    res.json().then(json => {
                        json.pendingClassesFeedbacks.map(reservation => {
                            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/reservation/${reservation}`, requestOptions).then(res2 => {
                                res2.json().then(json2 => {
                                    setPendingFeedback(prev => {
                                        let exists = false;
                                        prev.forEach(pfed => {
                                            if (pfed.reservation_id === reservation) exists = true;
                                        });

                                        if (!exists)
                                            return [
                                                ...prev,
                                                {
                                                    reservation_id: reservation,
                                                    receiver: {
                                                        id: json2.professor.id,
                                                        name: `${json2.professor.firstName} ${json2.professor.lastName}`,
                                                    },
                                                },
                                            ];
                                        else return prev;
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                router.push('/');
            }
        }

    }, [user, router]);

    useEffect(() => {
        setProfessors(data);
    }, [data]);

    const handleFilter = () => {
        if (locationSelected.length > 0 && subjectSelected.length === 0) {
            setProfessors(data.filter(professor => locationSelected.includes(professor.location)));
        } else if (locationSelected.length === 0 && subjectSelected.length > 0) {
            setProfessors(data.filter(professor => professor.subjects.some(subject => subjectSelected.includes(subject.name))));
        } else if (locationSelected.length > 0 && subjectSelected.length > 0) {
            setProfessors(
                data.filter(professor =>
                    professor.subjects.some(
                        subject => subjectSelected.includes(subject.name) && locationSelected.includes(professor.location)
                    )
                )
            );
        } else {
            setProfessors(data);
        }
    };

    const handleLocationChange = event => {
        setLocationSelected(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
    };

    const handleSubjectChange = event => {
        setSubjectSelected(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
    };

    const handleFeedback = () => {
        setFeedbackLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/feedback/giveFeedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
                studentId: user.id,
                professorId: pendingFeedback[0].receiver.id,
                roleReceptor: 'PROFESSOR',
                classId: pendingFeedback[0].reservation_id,
                rating: feedback.rating,
                material: feedback.material,
                punctuality: feedback.time,
                polite: feedback.kind,
            }),
        })
            .then(res => {
                if (res.status === 200)
                    setPendingFeedback(prev => {
                        prev.shift();
                        return prev;
                    });
            })
            .finally(() => {
                setFeedback({ rating: 0, time: 0, material: 0, kind: 0 });
                setFeedbackLoading(false);
            });
    };

    const handleFeedbackClick = opt => {
        if (feedback[opt] !== 0) {
            setFeedback(prev => ({ ...prev, [opt]: 0 }));
        } else {
            setFeedback(prev => ({ ...prev, [opt]: 1 }));
        }
    };

    return (
        <>
            <Grid container
                sx={{
                    display: 'flex',
                    backgroundColor: '#F5F5F5',
                    maxWidth: "100%"
                }}
            >
                <Box
                    sx={{
                        flexDirection: 'column',
                        minWidth: 300,
                        minHeight: 300,
                        display: 'flex',
                        px: 1,
                    }}
                >
                    <Typography variant='h3' component='div' sx={{ mt: 2, mb: 2, ml: 2 }} color={'black'}>
                        Filters
                    </Typography>
                    <Divider width={'100%'} sx={{ my: 2 }} />
                    <FormControl sx={{ ml: 2, backgroundColor: '#fff' }}>
                        <InputLabel id='office-select'>Location</InputLabel>
                        <Select
                            multiple
                            labelId='office-select'
                            input={<OutlinedInput label='Location' />}
                            value={locationSelected}
                            onChange={event => handleLocationChange(event)}
                            onClose={handleFilter}
                            renderValue={selected => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map(value => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            {data.map((profesor, index) => (
                                <MenuItem key={index} value={profesor.location}>
                                    {profesor.location}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ ml: 2, marginTop: '1.5rem', backgroundColor: '#fff' }}>
                        <InputLabel id='office-select'>Subjects</InputLabel>
                        <Select
                            multiple
                            labelId='office-select'
                            input={<OutlinedInput label='Subjects' />}
                            value={subjectSelected}
                            onChange={event => handleSubjectChange(event)}
                            onClose={handleFilter}
                            renderValue={selected => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map(value => (
                                        <Chip key={value} label={value} sx={{ backgroundColor: getColor(value) }} />
                                    ))}
                                </Box>
                            )}
                        >
                            {subjects.map(subject => (
                                <MenuItem key={subject.id} value={subject.name}>
                                    {subject.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {pendingFeedback.length === 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', mb: 2, ml: 2 }}>
                        {isLoading ? (
                            <>
                                <CircularProgress />
                                <Typography variant='h4' component='div' sx={{ mt: 2, mb: 2, ml: 2 }} color={'black'}>
                                    Loading professors...
                                </Typography>
                            </>
                        ) : (
                            <>
                                {professors.length === 0 ? (
                                    <Typography variant='h4' component='div' sx={{ mt: 2, mb: 2, ml: 2 }} color={'black'}>
                                        No professors found
                                    </Typography>
                                ) : (
                                    <>
                                        {professors.map((profesor, index) => {
                                            if (profesor.subjects.length > 0) {
                                                return (
                                                    <ProfessorCard
                                                        key={index}
                                                        professorId={profesor.id}
                                                        studentId={user.id}
                                                        name={profesor.firstName + ' ' + profesor.lastName}
                                                        email={profesor.email}
                                                        phone={profesor.phone}
                                                        sex={profesor.sex}
                                                        office={profesor.location}
                                                        style={{ mr: 3, mt: 2 }}
                                                        subjects={profesor.subjects}
                                                        rating={profesor.avgRating}
                                                    />
                                                );
                                            }
                                        })}
                                    </>
                                )}
                            </>
                        )}
                    </Box>
                )}
                {pendingFeedback.length > 0 && (
                    <Dialog open={true}>
                        {!feedbackLoading && (
                            <>
                                <DialogTitle>{`Give Feedback to ${pendingFeedback[0].receiver.name}`}</DialogTitle>
                                <DialogContent>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Rating
                                            precision={0.5}
                                            value={feedback.rating}
                                            onChange={(event, newValue) => {
                                                setFeedback(prev => ({ ...prev, rating: newValue }));
                                            }}
                                            sx={{ fontSize: 42 }}
                                            max={3}
                                            size='large'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: 10,
                                            marginBlock: '1.5rem',
                                        }}
                                    >
                                        <Tooltip title='Is always on time'>
                                            <AccessTimeIcon
                                                fontSize='large'
                                                sx={{ gridColumn: 1 / 3, row: 1, cursor: 'pointer' }}
                                                onClick={() => handleFeedbackClick('time')}
                                                color={feedback.time === 1 ? 'black' : 'disabled'}
                                            />
                                        </Tooltip>

                                        <Tooltip title='Has extra material to practice'>
                                            <InsertDriveFileIcon
                                                fontSize='large'
                                                sx={{ gridColumn: 1 / 3, row: 1, cursor: 'pointer' }}
                                                onClick={() => handleFeedbackClick('material')}
                                                color={feedback.material === 1 ? 'black' : 'disabled'}
                                            />
                                        </Tooltip>

                                        <Tooltip title='Is respectful and patient'>
                                            <SentimentSatisfiedAltIcon
                                                fontSize='large'
                                                sx={{ gridColumn: 1 / 3, row: 1, cursor: 'pointer' }}
                                                onClick={() => handleFeedbackClick('kind')}
                                                color={feedback.kind === 1 ? 'black' : 'disabled'}
                                            />
                                        </Tooltip>
                                    </div>
                                </DialogContent>
                                <DialogActions sx={{ justifyContent: 'center' }}>
                                    <Button variant='contained' onClick={handleFeedback}>
                                        Submit
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                        {feedbackLoading && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
                                <CircularProgress />
                                <Typography variant='h4' component='div' sx={{ mt: 2, mb: 2, ml: 2 }} color={'black'}>
                                    Sending Feedback...
                                </Typography>
                            </div>
                        )}
                    </Dialog>
                )}
            </Grid>
        </>
    );
}
