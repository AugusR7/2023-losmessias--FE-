import Head from 'next/head';
import Layout from '../components/ui/Layout';
import { Box, Chip, Divider, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Typography } from '@mui/material';
import ProfessorCard from '@/components/cards/ProfessorCard';
import { useState } from 'react';

export async function getServerSideProps() {
    const res = await fetch('http://localhost:8080/api/professor');
    const data = await res.json();

    const subjectsRes = await fetch('http://localhost:8080/api/subject');
    const subjects = await subjectsRes.json();
    return { props: { data, subjects } };
}

export default function Home({ data, subjects }) {
    const [professors, setProfessors] = useState(data);
    const [locationSelected, setLocationSelected] = useState([]);
    const [subjectSelected, setSubjectSelected] = useState([]);

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

    return (
        <>
            <Head>
                <title>Leherer</title>
                <link
                    rel='icon'
                    type='image/png'
                    href='https://icons.iconarchive.com/icons/paomedia/small-n-flat/512/book-bookmark-icon.png'
                />
            </Head>
            <Layout>
                <Box
                    sx={{
                        display: 'flex',
                        backgroundColor: '#F5F5F5',
                    }}
                >
                    <Box
                        sx={{
                            flexDirection: 'column',
                            minWidth: 300,
                            minHeight: 300,
                            display: 'flex',
                            borderColor: 'black',
                            borderWidth: '1pt',
                            borderRightStyle: 'solid',
                            px: 1,
                            // backgroundColor: "red"
                        }}
                    >
                        <Typography variant='h3' component='div' sx={{ mt: 2, mb: 2, ml: 2 }} color={'black'}>
                            Filters
                        </Typography>
                        <Divider width={'100%'} sx={{ my: 2 }} />
                        <FormControl sx={{ ml: 2 }}>
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

                        <FormControl sx={{ ml: 2, marginTop: '1.5rem' }}>
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
                                            <Chip key={value} label={value} />
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', mb: 2, ml: 2 }}>
                        {professors.map((profesor, index) => (
                            <ProfessorCard
                                key={index}
                                name={profesor.name}
                                email={profesor.email}
                                phone={profesor.phone}
                                office={profesor.location}
                                style={{ mr: 3, mt: 2 }}
                                subjects={profesor.subjects}
                            />
                        ))}
                    </Box>
                </Box>
            </Layout>
        </>
    );
}
