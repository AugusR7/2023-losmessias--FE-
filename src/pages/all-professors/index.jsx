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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
    Tooltip,
    Typography,
} from '@mui/material';
import MonthlyChart from '@/components/MonthlyChart.jsx';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useRouter } from 'next/router';
import useWindowSize from '@/hooks/useWindowSize.js';

export default function AllProfessors() {
    const [allProfessors, setAllProfessors] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [open, setOpen] = useState(false);
    const [professorId, setProfessorId] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const windowSize = useWindowSize();
    const [searchValue, setSearchValue] = useState('');
    const [filterValues, setFilterValues] = useState([]);
    const [sorters, setSorters] = useState({ avgRating: false, sumPunctuality: false, sumMaterial: false, sumPolite: false });

    const user = useUser();

    useEffect(() => {
        setIsLoading(true);
        if (router.isReady)
            if (user.id) {
                if (user.role == 'professor') router.push('/professor-landing');
                if (user.role === 'student') router.push('/student-landing');
                const requestOptions = {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/professor/all`, requestOptions)
                    .then(res =>
                        res.json().then(json => {
                            setAllProfessors(json);
                            setProfessors(json);
                        })
                    )
                    .finally(() => setIsLoading(false));
            } else {
                router.push('/');
            }

    }, [user, router]);

    const applySearchFilter = (searchValue, filterValues) => {
        if (searchValue !== '' && filterValues.length === 0) {
            setProfessors(
                allProfessors.filter(
                    prevprofessors =>
                        prevprofessors.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        prevprofessors.lastName.toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        } else if (searchValue === '' && filterValues.length > 0) {
            setProfessors(
                allProfessors.filter(prevProfessors => prevProfessors.subjects.some(subject => filterValues.includes(subject.name)))
            );
        } else if (searchValue !== '' && filterValues.length > 0) {
            setProfessors(
                allProfessors.filter(
                    prevProfessors =>
                        (prevProfessors.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                            prevProfessors.lastName.toLowerCase().includes(searchValue.toLowerCase())) &&
                        prevProfessors.subjects.some(subject => filterValues.includes(subject.name))
                )
            );
        } else setProfessors(allProfessors);
    };

    const handleSearch = (searchValue, filterValues) => {
        setPage(0);
        applySearchFilter(searchValue, filterValues);
        setSearchValue(searchValue);
        setFilterValues(filterValues);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClick = id => {
        setProfessorId(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function sortDataBy(field, direction) {
        const ascSorter = (a, b) => {
            return a[field] - b[field];
        };

        const descSorter = (a, b) => {
            return (a[field] - b[field]) * -1;
        };

        let sortedStudents = allProfessors;
        if (direction === 'asc') sortedStudents = allProfessors.sort(ascSorter);
        else if (direction === 'desc') sortedStudents = allProfessors.sort(descSorter);

        if (searchValue !== '' || filterValues.length > 0) {
            applySearchFilter(searchValue, filterValues);
        }

        setProfessors(sortedStudents);
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
            <Typography variant='h4'>Professors</Typography>
            <Divider />
            <div style={{ paddingBlock: '1rem' }} />

            {windowSize.width > 500}
            <Searchbar search={handleSearch} />
            <div style={styles.divPadding} />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Subjects</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sorters.avgRating}
                                    direction={!sorters.avgRating ? 'asc' : sorters.avgRating}
                                    onClick={() => handleSorterClick('avgRating')}
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
                            <TableCell align='right'>Monthly Mean</TableCell>
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
                                            <Typography variant='h4'>Loading professors...</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </>
                        ) : (
                            <>
                                {professors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align='center'>
                                            <Typography variant='h4'>No professors found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {professors.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(prof => (
                                            <TableRow key={prof.id} onClick={() => handleClick(prof.id)}>
                                                <TableCell>{`${prof.firstName} ${prof.lastName}`}</TableCell>
                                                <TableCell>{prof.email}</TableCell>
                                                <TableCell>
                                                    {prof.subjects.map(subject => (
                                                        <Chip
                                                            key={subject.id}
                                                            label={subject.name}
                                                            sx={{
                                                                backgroundColor: getColor(subject.name),
                                                                marginRight: '0.2rem',
                                                            }}
                                                        />
                                                    ))}
                                                </TableCell>
                                                <TableCell>
                                                    <div style={{ display: 'flex', gap: 5 }}>
                                                        <Rating precision={0.5} value={prof.avgRating} max={3} readOnly />
                                                        <Typography>{`(${prof.avgRating.toFixed(2)})`}</Typography>
                                                    </div>
                                                </TableCell>
                                                <TableCell align='center'>{prof.sumPunctuality}</TableCell>
                                                <TableCell align='center'>{prof.sumMaterial}</TableCell>
                                                <TableCell align='center'>{prof.sumPolite}</TableCell>
                                                <TableCell align='right'>
                                                    <Button variant='contained' onClick={() => handleClick(prof.id)}>
                                                        Dashboard
                                                    </Button>
                                                </TableCell>
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
                    count={professors ? professors.length : 0}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle align={windowSize.width > 500 ? 'left' : 'center'}>Monthly Mean</DialogTitle>

                <DialogContent>
                    <MonthlyChart id={professorId} legend />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} variant='contained'>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
