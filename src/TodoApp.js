import {
  Box,
  Button, ButtonGroup, Checkbox, Container, Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField
} from "@mui/material";
import {Delete, DoneAll, Edit} from "@mui/icons-material";
import {useState} from "react";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const [ALL, COMPLETED, ACTIVE] = [1, 2, 3];

function TodoInput({showActivateAll, onInsert, onCheckAll}) {
  let [text, setText] = useState('');

  const handleEnterPressed = (e) => {
    if (e.key === 'Enter') {
      if (text.trim().length > 0) {
        onInsert(text.trim());
        setText('');
      }
    }
  }

  const handleChange = (event) => {
    setText(event.target.value);
  }

  const handleClickCheckAll = () => {
    onCheckAll();
  }

  return (
    <TextField
      fullWidth
      InputProps={{
        startAdornment: showActivateAll &&
          <InputAdornment position="start">
            <IconButton onClick={handleClickCheckAll}>
              <DoneAll/>
            </IconButton>

          </InputAdornment>,
      }}
      onKeyDown={handleEnterPressed}
      value={text}
      onChange={handleChange}
    />
  )
}

function TodoItem({idx, active, text, onActiveChange, onDelete, onEdit}) {

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogText, setDialogText] = useState(text);
  const [showActions, setShowActions] = useState(false);

  const handleItemFocusIn = () => {
    setShowActions(true);
  }

  const handleItemFocusOut = () => {
    setShowActions(false);
  }

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogCancel = () => {
    setDialogText(text);
    setDialogOpen(false);
  };

  const handleDialogSave = () => {
    if (dialogText.trim().length > 0) {
      onEdit(idx, dialogText);
    }
    setDialogOpen(false);
  }

  const handleCheckBoxChange = (event) => {
    onActiveChange(idx, !event.target.checked);
  }

  const handleDialogTextChange = (event) => {
    setDialogText(event.target.value);
  }

  const handleDelete = () => {
    onDelete(idx);
  }

  return (
    <ListItem secondaryAction={
      <Box hidden={!showActions}>
        <IconButton
          edge="end"
          aria-label="edit"
          size={'small'}
          onClick={handleDialogOpen}
        >
          <Edit/>
        </IconButton>
        <IconButton
          edge="end"
          aria-label="delete"
          size={'small'}
          onClick={handleDelete}
        >
          <Delete/>
        </IconButton>
      </Box>
    }
              disablePadding
              onPointerOver={handleItemFocusIn}
              onPointerOut={handleItemFocusOut}
    >
      <ListItemButton role={undefined} dense>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={!active}
            disableRipple
            onChange={handleCheckBoxChange}
          />
        </ListItemIcon>
        <ListItemText id={text} primary={text} />
      </ListItemButton>
      <Dialog open={dialogOpen} onClose={handleDialogCancel}>
        <DialogTitle>Edit selected item</DialogTitle>
        <DialogContent>
          <TextField autoFocus
                     fullWidth
                     value={dialogText}
                     onChange={handleDialogTextChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>Cancel</Button>
          <Button onClick={handleDialogSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  )
}

function TodoList({list, onDelete, onEdit, onActiveChange, onShowChange}) {

  return (
    <List>
      {list?.map((vl, idx) => {
        if (onShowChange === COMPLETED) {
          return vl.active === false ?
            <TodoItem idx={idx}
                      active={vl.active}
                      text={vl.text}
                      key={vl.text}
                      onActiveChange={onActiveChange}
                      onDelete={onDelete}
                      onEdit={onEdit}
            /> : null;
        } else if (onShowChange === ACTIVE) {
          return vl.active ?
            <TodoItem idx={idx}
                      active={vl.active}
                      text={vl.text}
                      key={vl.text}
                      onActiveChange={onActiveChange}
                      onDelete={onDelete}
                      onEdit={onEdit}
            /> : null;
        } else {
          return <TodoItem idx={idx}
                           active={vl.active}
                           text={vl.text}
                           key={vl.text}
                           onActiveChange={onActiveChange}
                           onDelete={onDelete}
                           onEdit={onEdit}
          />;
        }
      })}
    </List>
  )
}

function TodoActions({onShowChange, onClear, itemsLeft}) {

  const handleShow = (show) => {
    return () => {
      onShowChange(show);
    }
  }

  const handleClear = () => {
    onClear();
  }

  return <Grid container>
    <Grid item xs={3}>{itemsLeft} items left</Grid>
    <Grid item xs={9}>
      <ButtonGroup size={'small'}>
        <Button onClick={handleShow(ALL)}> All </Button>
        <Button onClick={handleShow(ACTIVE)}> Active </Button>
        <Button onClick={handleShow(COMPLETED)}> Completed </Button>
        <Button onClick={handleClear}> Clear Completed </Button>
      </ButtonGroup>
    </Grid>
  </Grid>
}

export default function TodoApp() {
  const [todoList, setTodoList] = useState([]);
  const [showActivateAll, setShowActivateAll] = useState(false);
  const [checkAll, setCheckAll] = useState(true);
  const [show, setShow] = useState(ALL);
  const [itemsLeft, setItemsLeft] = useState(0);

  const insert = (text) => {
    const tmpList = todoList.concat([{active: true, text: text}]);
    const tmpLeft = updateLeft(tmpList);

    setTodoList(tmpList);
    setItemsLeft(tmpLeft);
    setShowActivateAll(true);
  }

  const del = (index) => {
    const tmpList = todoList.map(value => value);
    tmpList.splice(index, 1);
    const tmpLeft = updateLeft(tmpList);

    if (tmpList.length === 0) setShowActivateAll(false);
    setTodoList(tmpList);
    setItemsLeft(tmpLeft);
  }

  const edit = (index, text) => {
    const tmpList = todoList.map(value => value);
    tmpList[index].text = text;

    setTodoList(tmpList);
  }

  const toggleCheckAll = () => {
    const tmpList = todoList.map( ({text}) => {
      return {active: !checkAll, text: text};
    });
    const tmpLeft = updateLeft(tmpList);

    setTodoList(tmpList);
    setItemsLeft(tmpLeft);
    setCheckAll(!checkAll);
  }

  // mark a task as active and update the list
  const setTaskActive = (taskIndex, active) => {
    const tmpList = todoList.map(value => value);
    tmpList[taskIndex].active = active;
    const tmpLeft = updateLeft(tmpList);

    setTodoList(tmpList);
    setItemsLeft(tmpLeft);
  }

  const clearCompleted = () => {
    const tmpList = todoList.filter(({active}) => active === true);

    if (tmpList.length === 0) setShowActivateAll(false);
    setTodoList(tmpList);
  }

  return <Container maxWidth={'md'}>
  <Grid container direction={'column'}>
    <Grid item> <TodoInput showActivateAll={showActivateAll} onInsert={insert} onCheckAll={toggleCheckAll}/> </Grid>
    <Grid item> <TodoList list={todoList} onActiveChange={setTaskActive} onDelete={del} onEdit={edit} onShowChange={show}/> </Grid>
    {showActivateAll ? <Grid item> <TodoActions onShowChange={setShow} onClear={clearCompleted} itemsLeft={itemsLeft}/> </Grid>: null}
  </Grid>
  </Container>
}

const updateLeft = (list) => {
  let left = 0;
  list.forEach(({active}) => {
    if (active) {
      left += 1;
    }
  });
  return left;
}
