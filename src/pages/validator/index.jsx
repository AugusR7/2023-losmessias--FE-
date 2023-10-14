// components
import TeachersTable from './components/TeachersTable';
import Searchbar from '../../components/Searchbar';

// Hooks
import { useState } from 'react';

// styles
import { styles } from './styles.js';
import { Alert, Snackbar } from '@mui/material';

import { useUser } from "@/context/UserContext";

export async function getServerSideProps() {
   // const user = useUser();
  //  const requestOptions = {
  //      method: 'GET',
  //      headers: { Authorization : `Bearer ${user.token}`}
  //  };
    const res = await fetch('http://localhost:8080/api/professor-subject/findByStatus?status=PENDING');
    const data = await res.json();
    return { props: { data } };
}

export default function Validator({ data }) {
    const [allTeachersSubjects, setAllTeachersSubjects] = useState(data);
    const [teachersSubjects, setTeachersSubjects] = useState(data);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('');
    const user = useUser();

    const handleSearch = (searchValue, filterValues) => {
        if (searchValue !== '' && filterValues.length === 0) {
            setTeachersSubjects(
                allTeachersSubjects.filter(
                    prevTeacherSubject =>
                        prevTeacherSubject.professor.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        prevTeacherSubject.professor.lastName.toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        } else if (searchValue === '' && filterValues.length > 0) {
            setTeachersSubjects(allTeachersSubjects.filter(prevTeacherSubject => filterValues.includes(prevTeacherSubject.subject.name)));
        } else if (searchValue !== '' && filterValues.length > 0) {
            setTeachersSubjects(
                allTeachersSubjects.filter(
                    prevTeacherSubject =>
                        (prevTeacherSubject.professor.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                            prevTeacherSubject.professor.lastName.toLowerCase().includes(searchValue.toLowerCase())) &&
                        filterValues.includes(prevTeacherSubject.subject.name)
                )
            );
        } else setTeachersSubjects(allTeachersSubjects);
    };

    const handleApprove = teacherSubject => {
        console.log(teacherSubject);
        fetch('http://localhost:8080/api/professor-subject/approve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization : `Bearer ${user.token}`
            },
            body: JSON.stringify({
                professorId: teacherSubject.professor.id,
                subjectIds: [teacherSubject.subject.id],
            }),
        }).then(res => {
            if (res.status === 200) {
                setAllTeachersSubjects(prevTeachers =>
                    prevTeachers.filter(prevTeacherSubject => {
                        if (
                            prevTeacherSubject.professor.id === teacherSubject.professor.id &&
                            prevTeacherSubject.subject.id === teacherSubject.subject.id
                        ) {
                            return false;
                        }
                        return true;
                    })
                );

                setTeachersSubjects(prevTeachers =>
                    prevTeachers.filter(prevTeacherSubject => {
                        if (
                            prevTeacherSubject.professor.id === teacherSubject.professor.id &&
                            prevTeacherSubject.subject.id === teacherSubject.subject.id
                        ) {
                            return false;
                        }
                        return true;
                    })
                );
                setAlertSeverity('success');
                setAlertMessage(`${teacherSubject.professor.firstName}: ${teacherSubject.subject.name} has been approved!`);
            } else {
                setAlertSeverity('error');
                setAlertMessage(`${teacherSubject.professor.firstName}: ${teacherSubject.subject.name} approval failed!`);
            }
        });
        setAlert(true);
    };

    const handleReject = teacherSubject => {
        fetch('http://localhost:8080/api/professor-subject/reject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization : `Bearer ${user.token}`
            },
            body: JSON.stringify({
                professorId: teacherSubject.professor.id,
                subjectIds: [teacherSubject.subject.id],
            }),
        }).then(res => {
            if (res.status === 200) {
                setAllTeachersSubjects(prevTeachers =>
                    prevTeachers.filter(prevTeacherSubject => {
                        if (
                            prevTeacherSubject.professor.id === teacherSubject.professor.id &&
                            prevTeacherSubject.subject.id === teacherSubject.subject.id
                        ) {
                            return false;
                        }
                        return true;
                    })
                );

                setTeachersSubjects(prevTeachers =>
                    prevTeachers.filter(prevTeacherSubject => {
                        if (
                            prevTeacherSubject.professor.id === teacherSubject.professor.id &&
                            prevTeacherSubject.subject.id === teacherSubject.subject.id
                        ) {
                            return false;
                        }
                        return true;
                    })
                );
                setAlertSeverity('success');
                setAlertMessage(`${teacherSubject.professor.firstName}: ${teacherSubject.subject.name} has been rejected!`);
            } else {
                setAlertSeverity('error');
                setAlertMessage(`${teacherSubject.professor.firstName}: ${teacherSubject.subject.name} rejection failed!`);
            }
            setAlert(true);
        });
    };

    return (
        <div style={styles.container}>
            <Searchbar search={handleSearch} />
            <div style={styles.divPadding} />
            <TeachersTable data={teachersSubjects} approve={handleApprove} reject={handleReject} />
            <Snackbar
                open={alert}
                autoHideDuration={3000}
                onClose={() => setAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'top' }}
            >
                <Alert severity={alertSeverity}>{alertMessage}</Alert>
            </Snackbar>
        </div>
    );
}
