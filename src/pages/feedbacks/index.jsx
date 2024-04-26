// components
import Searchbar from '@/components/Searchbar.jsx';

// Hooks
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { getColor } from '@/utils/getColor.js';

// styles
import { styles } from '../../styles/validator-styles.js';

// Mui
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Rating,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/router.js';

export default function Feedbacks() {
    const [allFeedbacks, setAllFeedbacks] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [sorters, setSorters] = useState({ date: false, rating: false, sumPunctuality: false, sumMaterial: false, sumPolite: false });

    const user = useUser();
    const router = useRouter();

    useEffect(() => {
        if (router.isReady)
            if (user.id) {
                if (user.role === 'professor') router.push('/professor-landing');
                if (user.role === 'student') router.push('/student-landing');
                const requestOptions = {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                setIsLoading(true);
                fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/feedback/getAllFeedbacks`, requestOptions)
                    .then(res =>
                        res.json().then(json => {
                            setAllFeedbacks(json);
                            setFeedbacks(json);
                        })
                    )
                    .finally(() => setIsLoading(false));
            } else {
                router.push('/');
            }
    }, [user, router]);

    const handleSearch = e => {
        e.preventDefault();

        if (searchValue !== '') {
            setFeedbacks(
                allFeedbacks.filter(
                    prevFeedbacks =>
                        prevFeedbacks.professor.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        prevFeedbacks.professor.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        prevFeedbacks.student.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        prevFeedbacks.student.lastName.toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        } else setFeedbacks(allFeedbacks);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    function sortDataBy(field, direction) {
        const ascSorter = (a, b) => {
            return a[field] - b[field];
        };

        const descSorter = (a, b) => {
            return (a[field] - b[field]) * -1;
        };

        const ascOptSorter = (a, b) => {
            if (field === 'sumPunctuality') return a.feedbackOptions.includes('PUNCTUALITY') ? 1 : -1;
            else if (field === 'sumMaterial') return a.feedbackOptions.includes('MATERIAL') ? 1 : -1;
            else return a.feedbackOptions.includes('POLITE') ? 1 : -1;
        };

        const descOptSorter = (a, b) => {
            if (field === 'sumPunctuality') return a.feedbackOptions.includes('PUNCTUALITY') ? -1 : 1;
            else if (field === 'sumMaterial') return a.feedbackOptions.includes('MATERIAL') ? -1 : 1;
            else return a.feedbackOptions.includes('POLITE') ? -1 : 1;
        };

        const ascDateSorter = (a, b) => {
            if (a.dateTimeOfFeedback[0] > b.dateTimeOfFeedback[0]) return 1;
            else if (a.dateTimeOfFeedback[0] < b.dateTimeOfFeedback[0]) return -1;
            else {
                if (a.dateTimeOfFeedback[1] > b.dateTimeOfFeedback[1]) return 1;
                else if (a.dateTimeOfFeedback[1] < b.dateTimeOfFeedback[1]) return -1;
                else {
                    if (a.dateTimeOfFeedback[2] > b.dateTimeOfFeedback[2]) return 1;
                    else if (a.dateTimeOfFeedback[2] < b.dateTimeOfFeedback[2]) return -1;
                    else return 1;
                }
            }
        };

        const descDateSorter = (a, b) => {
            if (a.dateTimeOfFeedback[0] > b.dateTimeOfFeedback[0]) return -1;
            else if (a.dateTimeOfFeedback[0] < b.dateTimeOfFeedback[0]) return 1;
            else {
                if (a.dateTimeOfFeedback[1] > b.dateTimeOfFeedback[1]) return -1;
                else if (a.dateTimeOfFeedback[1] < b.dateTimeOfFeedback[1]) return 1;
                else {
                    if (a.dateTimeOfFeedback[2] > b.dateTimeOfFeedback[2]) return -1;
                    else if (a.dateTimeOfFeedback[2] < b.dateTimeOfFeedback[2]) return 1;
                    else return -1;
                }
            }
        };

        let sortedStudents = allFeedbacks;

        if (field === 'date') {
            if (direction === 'asc') sortedStudents = allFeedbacks.sort(ascDateSorter);
            else if (direction === 'desc') sortedStudents = allFeedbacks.sort(descDateSorter);
        } else if (field === 'sumPunctuality' || field === 'sumMaterial' || field === 'sumPolite') {
            if (direction === 'asc') sortedStudents = allFeedbacks.sort(ascOptSorter);
            else if (direction === 'desc') sortedStudents = allFeedbacks.sort(descOptSorter);
        } else {
            if (direction === 'asc') sortedStudents = allFeedbacks.sort(ascSorter);
            else if (direction === 'desc') sortedStudents = allFeedbacks.sort(descSorter);
        }

        if (searchValue !== '') {
            sortedStudents = sortedStudents.filter(
                prevFeedbacks =>
                    prevFeedbacks.professor.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    prevFeedbacks.professor.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    prevFeedbacks.student.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    prevFeedbacks.student.lastName.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        setFeedbacks(sortedStudents);
        setPage(0);
    }

    const handleSorterClick = property => {
        let newSorter = {};
        Object.keys(sorters).forEach(key => {
            if (key === property) {
                if (!sorters[key]) newSorter[key] = 'asc';
                else if (sorters[key] === 'asc') newSorter[key] = 'desc';
                else if (sorters[key] === 'desc') newSorter[key] = false;
            } else newSorter[key] = false;
        });
        sortDataBy(property, newSorter[property]);
        setSorters(newSorter);
    };

    return (
        <div style={styles.container}>
            <Typography variant='h4'>Feedbacks</Typography>
            <Divider />
            <div style={{ paddingBlock: '1rem' }} />
            <form onSubmit={handleSearch} style={styles.searchForm}>
                <TextField
                    value={searchValue}
                    onChange={event => setSearchValue(event.target.value)}
                    label='Search'
                    variant='outlined'
                    size='small'
                    sx={styles.searchInput}
                />
                <Button variant='contained' type='submit' sx={styles.searchButton}>
                    <SearchIcon />
                </Button>
            </form>
            <div style={styles.divPadding} />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Giver</TableCell>
                            <TableCell>Receiver</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sorters.date}
                                    direction={!sorters.date ? 'asc' : sorters.date}
                                    onClick={() => handleSorterClick('date')}
                                >
                                    Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sorters.rating}
                                    direction={!sorters.rating ? 'asc' : sorters.rating}
                                    onClick={() => handleSorterClick('rating')}
                                >
                                    Rating
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align='center'>
                                <Tooltip title='Is always on time'>
                                    <TableSortLabel
                                        active={sorters.sumPunctuality}
                                        direction={!sorters.sumPunctuality ? 'asc' : sorters.sumPunctuality}
                                        onClick={() => handleSorterClick('sumPunctuality')}
                                    >
                                        <AccessTimeIcon />
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                            <TableCell align='center'>
                                <Tooltip title='Do the homework'>
                                    <TableSortLabel
                                        active={sorters.sumMaterial}
                                        direction={!sorters.sumMaterial ? 'asc' : sorters.sumMaterial}
                                        onClick={() => handleSorterClick('sumMaterial')}
                                    >
                                        <InsertDriveFileIcon />
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                            <TableCell align='center'>
                                <Tooltip title='Pays attention and listens'>
                                    <TableSortLabel
                                        active={sorters.sumPolite}
                                        direction={!sorters.sumPolite ? 'asc' : sorters.sumPolite}
                                        onClick={() => handleSorterClick('sumPolite')}
                                    >
                                        <SentimentSatisfiedAltIcon />
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            <>
                                <TableRow>
                                    <TableCell colSpan={8} align='center'>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <CircularProgress sx={{ mr: 2 }} />
                                            <Typography variant='h4'>Loading feedbacks...</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </>
                        ) : (
                            <>
                                {feedbacks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align='center'>
                                            <Typography variant='h4'>No students found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {feedbacks.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(feed => (
                                            <TableRow key={feed.id}>
                                                <TableCell>
                                                    {feed.receptorRole === 'STUDENT'
                                                        ? `${feed.professor.firstName} ${feed.professor.lastName}`
                                                        : `${feed.student.firstName} ${feed.student.lastName}`}
                                                </TableCell>
                                                <TableCell>
                                                    {feed.receptorRole === 'STUDENT'
                                                        ? `${feed.student.firstName} ${feed.student.lastName}`
                                                        : `${feed.professor.firstName} ${feed.professor.lastName}`}
                                                </TableCell>
                                                <TableCell>
                                                    {`${feed.dateTimeOfFeedback[2]}-${feed.dateTimeOfFeedback[1]}-${feed.dateTimeOfFeedback[0]}`}
                                                </TableCell>
                                                <TableCell>
                                                    <div style={{ display: 'flex', gap: 5 }}>
                                                        <Rating precision={0.5} value={feed.rating} max={3} readOnly />
                                                        <Typography>{`(${feed.rating.toFixed(2)})`}</Typography>
                                                    </div>
                                                </TableCell>
                                                <TableCell align='center'>{feed.feedbackOptions.includes('PUNCTUALITY') ? 1 : 0}</TableCell>
                                                <TableCell align='center'>{feed.feedbackOptions.includes('MATERIAL') ? 1 : 0}</TableCell>
                                                <TableCell align='center'>{feed.feedbackOptions.includes('POLITE') ? 1 : 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component='div'
                    count={feedbacks ? feedbacks.length : 0}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </div>
    );
}
