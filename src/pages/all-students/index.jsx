// components
import Searchbar from '@/components/Searchbar.jsx';

// Hooks
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { getColor } from '@/utils/getColor.js';

// styles
import { styles } from '../../styles/validator-styles.js';

import { useRouter } from 'next/router';

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

export default function AllStudents() {
    const [allStudents, setAllStudents] = useState([]);
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();
    const user = useUser();
    const [sorters, setSorters] = useState({ avgRating: false, sumPunctuality: false, sumMaterial: false, sumPolite: false });

    useEffect(() => {
        if (router.isReady)
            if (user.id) {
                if (user.authenticated) {
                    if (user.role === 'student') router.push('/student-landing');
                    if (user.role === 'professor') router.push('/professor-landing');
                    const requestOptions = {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${user.token}` },
                    };
                    setIsLoading(true);
                    fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/student/all`, requestOptions)
                        .then(res =>
                            res.json().then(json => {
                                setAllStudents(json);
                                setStudents(json);
                            })
                        )
                        .finally(() => setIsLoading(false));
                } else {
                    router.push('/');
                }
            }
    }, [router, user]);

    const handleSearch = e => {
        e.preventDefault();
        setPage(0);

        if (searchValue !== '') {
            setStudents(
                allStudents.filter(
                    prevStudents =>
                        prevStudents.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        prevStudents.lastName.toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        } else setStudents(allStudents);
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

        let sortedStudents = allStudents;
        if (direction === 'asc') sortedStudents = allStudents.sort(ascSorter);
        else if (direction === 'desc') sortedStudents = allStudents.sort(descSorter);

        if (searchValue !== '') {
            sortedStudents = sortedStudents.filter(
                prevStudents =>
                    prevStudents.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    prevStudents.lastName.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        setStudents(sortedStudents);
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
            <Typography variant='h4'>Students</Typography>
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
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
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
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align='center'>
                                            <Typography variant='h4'>No students found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {students.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(stu => (
                                            <TableRow key={stu.id}>
                                                <TableCell>{`${stu.firstName} ${stu.lastName}`}</TableCell>
                                                <TableCell>{stu.email}</TableCell>
                                                <TableCell>
                                                    <div style={{ display: 'flex', gap: 5 }}>
                                                        <Rating precision={0.5} value={stu.avgRating} max={3} readOnly />
                                                        <Typography>{`(${stu.avgRating.toFixed(2)})`}</Typography>
                                                    </div>
                                                </TableCell>
                                                <TableCell align='center'>{stu.sumPunctuality}</TableCell>
                                                <TableCell align='center'>{stu.sumMaterial}</TableCell>
                                                <TableCell align='center'>{stu.sumPolite}</TableCell>
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
                    count={students ? students.length : 0}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </div>
    );
}
