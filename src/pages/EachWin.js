import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Paper from '@material-ui/core/Paper';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import moment from 'moment';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useSelector, useDispatch } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import { useHistory } from 'react-router-dom';

import { URL } from '../utils/constants';
import LikeBtn from '../components/layout/LikeBtn';
import CommentBtn from '../components/layout/CommentBtn';
import WinSkeleton from '../components/skeletons/WinSkeleton';
import CommentField from '../components/layout/CommentField';
import EachComment from '../components/layout/EachComment';
import { selectUser } from '../redux/slices/authSlice';
import { SET_LOADING_FALSE, SET_LOADING_TRUE } from '../redux/slices/winsSlice';
import { deleteAWin } from '../redux/actions/winsActions';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(3),
  },
  container: {
    marginTop: theme.spacing(2),
    maxWidth: '750px',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  avatar: {
    backgroundColor: 'red',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const EachWin = () => {
  const history = useHistory();
  const classes = useStyles();
  const { winId } = useParams();
  const loading = useSelector((state) => state.wins.loading);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = async (winId) => {
    dispatch(SET_LOADING_TRUE());
    const errorWhileDeleting = await deleteAWin(winId);
    setAnchorEl(null);
    dispatch(SET_LOADING_FALSE());
    if (!errorWhileDeleting) {
      history.push('/home');
    }
  };
  useEffect(() => {
    async function getAWin() {
      try {
        const res = await axios.get(`${URL}/win/${winId}`);
        setData(res.data);
        console.log(res.data);
      } catch (error) {
        console.log('error finding a single post');
      }
    }
    getAWin();
  }, [winId]);
  if (data === null) {
    return <WinSkeleton />;
  }
  return (
    <Container className={classes.container}>
      <Paper>
        <Card className={classes.root}>
          <CardHeader
            avatar={
              <Avatar aria-label="recipe" className={classes.avatar}>
                S
              </Avatar>
            }
            action={
              user?.info?.username === data.username && (
                <>
                  <IconButton
                    aria-label="settings"
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => handleDelete(data.winId)}>
                      Delete Win
                    </MenuItem>
                  </Menu>
                </>
              )
            }
            title={data.username}
            subheader={moment(data?.createdAt).fromNow()}
          />
          <CardMedia
            className={classes.media}
            image="https://images.unsplash.com/photo-1595835018346-5f8fb50fa837?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
            title="sample"
          />
          <CardContent>
            <Typography variant="h6" color="black" component="p">
              {data.title}
            </Typography>
            <Typography variant="body1" color="textSecondary" component="p">
              {data.body}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <Grid container>
              <LikeBtn likesCount={data?.likesCount} winId={winId} />
              <CommentBtn winId={winId} commentsCount={data.commentsCount} />
            </Grid>
          </CardActions>
          <CommentField
            setData={setData}
            showComment={true}
            winId={data.winId}
          />
          {data.comments &&
            data.comments.map((comment) => (
              <EachComment setData={setData} comment={comment} />
            ))}
        </Card>
      </Paper>
      {loading && (
        <Backdrop className={classes.backdrop} open={true}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Container>
  );
};

export default EachWin;
