import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { memberAPI, membershipAPI } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface Membership {
  id: number;
  member_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'pending' | 'expired';
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      navigate('/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const membersData = await memberAPI.getAll();
      setMembers(membersData as Member[]);

      // Load all memberships for all members
      const membershipsPromises = membersData.map((member: Member) =>
        membershipAPI.getByMemberId(member.id)
      );
      const membershipsData = await Promise.all(membershipsPromises);
      setMemberships(membershipsData.flat() as Membership[]);

      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditMember = (id: number) => {
    navigate(`/admin/members/${id}`);
  };

  const handleDeleteMember = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await memberAPI.delete(id);
        setMembers(members.filter(member => member.id !== id));
      } catch (err) {
        setError('Failed to delete member');
        console.error('Error deleting member:', err);
      }
    }
  };

  const handleEditMembership = (memberId: number) => {
    navigate(`/admin/memberships/${memberId}`);
  };

  const handleCancelMembership = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this membership?')) {
      try {
        await membershipAPI.cancel(id);
        await loadData(); // Reload all data
      } catch (err) {
        setError('Failed to cancel membership');
        console.error('Error canceling membership:', err);
      }
    }
  };

  const handleAddMember = () => {
    navigate('/admin/members/new');
  };

  const handleAddMembership = () => {
    navigate('/admin/memberships/new');
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Admin Command Center
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Track members, manage memberships, and keep the studio running smoothly.
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Members" />
            <Tab label="Memberships" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddMember}
            sx={{ mb: 2, borderRadius: 999 }}
          >
            Add New Member
          </Button>

          <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid rgba(17, 24, 39, 0.08)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        No members yet. Add your first member to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member: Member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.id}</TableCell>
                      <TableCell>{`${member.first_name} ${member.last_name}`}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditMember(member.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteMember(member.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddMembership}
            sx={{ mb: 2, borderRadius: 999 }}
          >
            Create New Membership
          </Button>

          <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid rgba(17, 24, 39, 0.08)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">
                        No memberships yet. Create one to activate member access.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  memberships.map((membership: Membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>{membership.id}</TableCell>
                      <TableCell>
                        {(() => {
                          const member = members.find((m) => m.id === membership.member_id);
                          return member ? `${member.first_name} ${member.last_name}` : 'Unknown';
                        })()}
                      </TableCell>
                      <TableCell>{new Date(membership.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(membership.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>{membership.status}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditMembership(membership.member_id)}>
                          <EditIcon />
                        </IconButton>
                        {membership.status === 'active' && (
                          <IconButton onClick={() => handleCancelMembership(membership.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 