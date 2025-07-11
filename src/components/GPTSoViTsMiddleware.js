import React from 'react';
import icons from '../shared/icons';
import Mui from '../shared/mui';
import * as Api from '../shared/remote';
import Message from '../components/Message';

function NotConfigured() {
  return <Mui.Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
    <Mui.Typography variant="h5" style={{ marginTop: 20 }}>
      GPT-SoViTs Middleware Not Configured
    </Mui.Typography>
    <Mui.Typography variant="body1" style={{ marginTop: 10 }}>
      {"You may go to More -> Settings -> GPT-SoViTs Middleware API URL to add a GPT-SoViTs middleware API URL."}
    </Mui.Typography>
    <Mui.Typography variant="body1" style={{ marginTop: 10 }}>
      A GPT-SoViTs middleware is the web interface of AIDub that integrated one-key voice dataset preprocessing and voice model training,
      which can significantly reduce the workload of data preparation and model training for users.
    </Mui.Typography>
  </Mui.Box>
}


function AddNewCharacterDialog({ open, onOk, onErr, onClose }) {
  const [names, setNames] = React.useState([]);
  const [editingName, setEditingName] = React.useState('');
  const [sourcesToFetch, setSourcesToFetch] = React.useState([]);
  const [editingSource, setEditingSource] = React.useState(null);

  return <Mui.Dialog open={open} onClose={onClose}>
    <Mui.DialogTitle>Add New Character</Mui.DialogTitle>
    <Mui.DialogContent sx={{ minWidth: '40vw' }}>
      <div style={{ marginTop: 10 }}></div>
      <Mui.TextField fullWidth label="Character Name" value={editingName} onChange={(e) => setEditingName(e.target.value)}></Mui.TextField>
      <Mui.Button
        onClick={() => {
          if (editingName) {
            setNames([...names, editingName])
            setEditingName("")
          } else {
            onErr('Please enter a name for the character')
          }
        }}
        edge="end"
        variant="contained"
        startIcon={<icons.Add />}
        fullWidth
        style={{ marginTop: 5 }}
      >
        Add Character
      </Mui.Button>
      <Mui.List sx={{ maxHeight: 100, overflowY: 'scroll' }} class='scroll-container'>
        {names.map((name, index) => <Mui.ListItem key={index}>
          <Mui.ListItemText primary={name} />
          <Mui.IconButton onClick={() => {
            setNames(names.filter((_, i) => i !== index))
            setEditingName(null)
          }}><icons.Delete /></Mui.IconButton>
        </Mui.ListItem>)}
      </Mui.List>
      <Mui.Box style={{ marginTop: 10 }}>
        <Mui.TextField
          fullWidth
          value={editingSource}
          onChange={(e) => setEditingSource(e.target.value)}
          label="Sources to Fetch"
          placeholder="Enter source URL"
          style={{ marginTop: 5 }}
        ></Mui.TextField>
        <Mui.Button
          onClick={() => {
            if (editingSource) {
              setSourcesToFetch([...sourcesToFetch, editingSource])
              setEditingSource("")
            } else {
              onErr('Please enter a source URL to fetch')
            }
          }}
          edge="end"
          variant="contained"
          startIcon={<icons.Add />}
          fullWidth
          style={{ marginTop: 5 }}
        >
          Add Source
        </Mui.Button>
        <Mui.List sx={{ maxHeight: 100, overflowY: 'scroll' }} class='scroll-container'>
          {sourcesToFetch.map((source, index) => <Mui.ListItem key={index}>
            <Mui.ListItemText primary={source} />
            <Mui.IconButton onClick={() => {
              setSourcesToFetch(sourcesToFetch.filter((_, i) => i !== index))
              setEditingSource(null)
            }}><icons.Delete /></Mui.IconButton>
          </Mui.ListItem>)}
        </Mui.List>
      </Mui.Box>
    </Mui.DialogContent>
    <Mui.DialogActions>
      <Mui.Button onClick={() => {
        onClose()
      }}>Cancel</Mui.Button>
      <Mui.Button onClick={() => {
        onOk({ names, sourcesToFetch })
        onClose()
      }} disabled={names.length === 0 || sourcesToFetch.length === 0}>Add</Mui.Button>
    </Mui.DialogActions>
  </Mui.Dialog>
}


function TaskViewDialog({ taskId, raiseMessage, open, onClose }) {
  const [task, setTask] = React.useState({ stagesDescription: { total_stages: [], current_stage: 0 } });
  const refresher = React.useRef(null);

  React.useEffect(() => {
    if (taskId) {
      Api.trackTask(taskId).then(r => {
        if (r.data.status) {
          // read json
          r.data.data.stagesDescription = JSON.parse(r.data.data.stagesDescription)
          setTask(r.data.data)
          let intvId = setInterval(() => {
            Api.trackTask(taskId).then(r => {
              if (r.data.status) {
                r.data.data.stagesDescription = JSON.parse(r.data.data.stagesDescription)
                setTask(r.data.data)
              }
            })
          }, 1000)
          refresher.current = intvId
        } else {
          raiseMessage('Error', `Failed to get task ${taskId}: ${r.data.data}`, 'error')
        }
      }).catch(e => {
        raiseMessage('Error', `Failed to get task ${taskId}: ${e}`, 'error')
      })
    }
    return () => {
      if (refresher.current) {
        clearInterval()
      }
    }
  }, [taskId])
  React.useEffect(() => {
    if (task.status === 'completed' || task.status === 'failed') {
      console.log('clear interval', refresher.current)
      if (refresher.current) {
        clearInterval(refresher.current)
      }
    }
  }, [task])

  return <>{taskId && <Mui.Dialog open={open} onClose={() => {
    if (refresher) {
      clearInterval(refresher)
    }
    onClose()
  }}>
    <Mui.DialogTitle>
      Task #{taskId} details
    </Mui.DialogTitle>
    <Mui.DialogContent>
      <Mui.Grid container spacing={1} alignItems={'center'} justifyContent={'center'}>
        <Mui.Grid item xs={12} sm={12}>
          <Mui.LinearProgress variant="determinate" value={(task.stagesDescription.current_stage) / task.stagesDescription.total_stages.length * 100} />
        </Mui.Grid>
        <Mui.Grid item xs={12} sm={6}>
          <Mui.Typography color='text.primary'>Begin Time: </Mui.Typography>
          <Mui.Typography color='text.secondary'>{task.creationTime}</Mui.Typography>
        </Mui.Grid>
        <Mui.Grid item xs={12} sm={6}>
          <Mui.Typography color='text.primary'>End Time: </Mui.Typography>
          <Mui.Typography color='text.secondary'>{task.completionTime}</Mui.Typography>
        </Mui.Grid>
        <Mui.Grid item xs={12} sm={6}>
          <Mui.Typography color='text.primary'>Current Stage: </Mui.Typography>
          <Mui.Typography color='text.secondary'>{task.stagesDescription.current_stage}: {task.stagesDescription.total_stages[task.stagesDescription.current_stage - 1]}</Mui.Typography>
        </Mui.Grid>
        <Mui.Grid item xs={12} sm={6}>
          <Mui.Typography color='text.primary'>Status: </Mui.Typography>
          <Mui.Typography color='text.secondary'>{task.status}</Mui.Typography>
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Mui.TextField
            fullWidth
            label="Log text"
            multiline
            rows={8}
            value={task.log}
          />
        </Mui.Grid>
      </Mui.Grid>
    </Mui.DialogContent>
    <Mui.DialogActions>
      <Mui.Button onClick={() => {
        if (refresher) {
          clearInterval(refresher)
        }
        onClose()
      }}>Close</Mui.Button>
    </Mui.DialogActions>
  </Mui.Dialog>}</>
}


function PanelModels({ middlewareInfo, raiseMessage }) {
  const [tableContent, setTableContent] = React.useState([]);
  const [addNewCharacterOpen, setAddNewCharacterOpen] = React.useState(false);

  React.useEffect(() => {
    let r = []
    for (let i in middlewareInfo.models_path) {
      r.push({
        name: i,
        paths: middlewareInfo.models_path[i]
      })
      console.log({
        name: i,
        paths: middlewareInfo.models_path[i]
      })
      setTableContent(r)
    }
  }, [middlewareInfo])
  return <Mui.Box style={{ height: '100%', overflowY: 'scroll' }} class='scroll-container'>
    <Mui.Typography variant="body1" style={{ marginTop: 10 }}>
      A GPT-SoViTs middleware is the web interface of AIDub that integrated one-key voice dataset preprocessing and voice model training,
      which can significantly reduce the workload of data preparation and model training for users.
    </Mui.Typography>
    <div style={{ marginTop: 20 }}></div>
    <Mui.Box sx={{ paddingRight: 10 }}>
      {tableContent.map((item, index) => <Mui.Accordion>
        <Mui.AccordionSummary>
          <Mui.Typography sx={{ width: '33%', flexShrink: 0 }}>{item.name}</Mui.Typography>
          <Mui.Typography sx={{ color: 'text.secondary' }}>
            #{index + 1}
          </Mui.Typography>
        </Mui.AccordionSummary>
        <Mui.AccordionDetails>
          <Mui.Box>
            <Mui.Typography variant="body1" style={{ marginTop: 10 }}>
              GPT model path: {item.paths[0]}
            </Mui.Typography>
          </Mui.Box>
          <Mui.Box>
            <Mui.Typography variant="body1" style={{ marginTop: 10 }}>
              SoVITs model path: {item.paths[1]}
            </Mui.Typography>
          </Mui.Box>
        </Mui.AccordionDetails>
      </Mui.Accordion>)}
      <div style={{ marginTop: 20 }}></div>
    </Mui.Box>
    <Mui.Fab sx={{
      position: 'fixed',
      bottom: 16,
      right: 16,
    }} color="primary" onClick={(e) => {
      setAddNewCharacterOpen(true)
    }}>
      <icons.MoreVert />
    </Mui.Fab>
    <AddNewCharacterDialog
      open={addNewCharacterOpen}
      onOk={(data) => {
        Api.runTraining(data.names, data.sourcesToFetch).then(r => {
          if (r.data.status) {
            raiseMessage('Success', `Training task for ${data.name} submitted successfully`, 'success')
          } else {
            raiseMessage('Error', `Failed to submit training task for ${data.name}: ${r.data.data}`, 'error')
          }
        }).catch(e => {
          raiseMessage('Error', `Failed to submit training task for ${data.name}: ${e}`, 'error')
        })
      }}
      onErr={(err) => {
        raiseMessage('Error', `Failed to add new character: ${err}`, 'error')
      }}
      onClose={() => {
        setAddNewCharacterOpen(false)
      }}
    ></AddNewCharacterDialog>
  </Mui.Box>
}


function PanelTasks({ middlewareInfo, raiseMessage }) {
  const [tasks, setTasks] = React.useState([]);
  const [taskViewOpen, setTaskViewOpen] = React.useState(false);
  const [taskViewId, setTaskViewId] = React.useState(null);

  React.useEffect(() => {
    Api.getMiddlewareTasks().then(r => {
      if (r.data.status) {
        r.data.data.forEach(e => {
          e.stagesDescription = JSON.parse(e.stagesDescription)
        })
        setTasks(r.data.data);
      } else {
        raiseMessage('Error', `Failed to get tasks: ${r.data.data}`, 'error')
      }
    }).catch(e => {
      raiseMessage('Error', `Failed to get tasks: ${e}`, 'error')
    });
  }, [])

  return <Mui.Box style={{ height: '100%', overflowY: 'scroll' }} class='scroll-container'>
    <Mui.Typography variant="body1" style={{ marginTop: 10 }}>
      Check all training tasks on GPT-SoViTs middleware.
    </Mui.Typography>
    <div style={{ marginTop: 20 }}></div>
    <Mui.TableContainer>
      <Mui.Table>
        <Mui.TableHead>
          <Mui.TableRow>
            <Mui.TableCell>Task ID</Mui.TableCell>
            <Mui.TableCell>Status</Mui.TableCell>
            <Mui.TableCell>Progress</Mui.TableCell>
            <Mui.TableCell>Begin Time</Mui.TableCell>
            <Mui.TableCell>Actions</Mui.TableCell>
          </Mui.TableRow>
        </Mui.TableHead>
        <Mui.TableBody>
          {tasks.map((task, index) => <Mui.TableRow key={index}>
            <Mui.TableCell>{task.id}</Mui.TableCell>
            <Mui.TableCell>{task.status}</Mui.TableCell>
            <Mui.TableCell>{task.stagesDescription.current_stage} / {task.stagesDescription.total_stages.length}</Mui.TableCell>
            <Mui.TableCell>{task.creationTime}</Mui.TableCell>
            <Mui.TableCell>
              <Mui.IconButton onClick={() => {
                setTaskViewId(task.id)
                setTaskViewOpen(true)
              }}><icons.Info color="primary" /></Mui.IconButton>
              <Mui.IconButton onClick={() => {
                Api.deleteMiddlewareTask(task.id).then(r => {
                  if (r.data.status) {
                    setTasks(tasks.filter(e => e.id !== task.id))
                    raiseMessage('Success', `Task ${task.id} deleted successfully`, 'success')
                  } else {
                    raiseMessage('Error', `Failed to delete task ${task.id}: ${r.data.data}`, 'error')
                  }
                }).catch(e => {
                  raiseMessage('Error', `Failed to delete task ${task.id}: ${e}`, 'error')
                })
              }}><icons.Delete color="primary" /></Mui.IconButton>
            </Mui.TableCell>
          </Mui.TableRow>)}
        </Mui.TableBody>
      </Mui.Table>
    </Mui.TableContainer>
    <TaskViewDialog taskId={taskViewId} open={taskViewOpen} onClose={() => {
      setTaskViewOpen(false)
    }} raiseMessage={raiseMessage}></TaskViewDialog>
  </Mui.Box>
}


function GPTSoViTsMiddleware({ }) {
  const [middlewareInfo, setMiddlewareInfo] = React.useState({});
  // message related
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('')
  const [messageOpen, setMessageOpen] = React.useState(false)

  const [currentPanel, setCurrentPanel] = React.useState('models')

  React.useEffect(() => {
    Api.getMiddlewareInfo().then(r => {
      if (r.data.status) {
        setMiddlewareInfo(r.data.data);
      } else {
        if (r.data.data === "Middleware not configured") {
          setMiddlewareInfo({});
          return;
        }
        setMessageTitle('Error')
        setMessageContent(`Failed to get middleware info: ${r.data.data}`)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(e => {
      console.error(e);
      setMessageTitle('Error')
      setMessageContent(`Failed to get middleware info: ${e}`)
      setMessageType('error')
      setMessageOpen(true)
    });
  }, [])
  return <Mui.Box sx={{ height: 'calc(100% - 48px)', width: 'calc(100% - 30px)', marginLeft: 30 }}>
    <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)}></Message>
    {middlewareInfo === {} && <NotConfigured></NotConfigured>}
    {middlewareInfo !== {} && <Mui.Tabs value={currentPanel} onChange={setCurrentPanel} aria-label="basic tabs example">
      <Mui.Tab label="Models" value="models" onClick={() => {
        setCurrentPanel('models')
      }}></Mui.Tab>
      <Mui.Tab label="Tasks" value="tasks" onClick={() => {
        setCurrentPanel('tasks')
      }}></Mui.Tab>
    </Mui.Tabs>}
    {currentPanel === 'models' && <PanelModels middlewareInfo={middlewareInfo} raiseMessage={(title, content, type) => {
      setMessageTitle(title)
      setMessageContent(content)
      setMessageType(type)
      setMessageOpen(true)
    }}></PanelModels>}
    {currentPanel === 'tasks' && <PanelTasks middlewareInfo={middlewareInfo} raiseMessage={(title, content, type) => {
      setMessageTitle(title)
      setMessageContent(content)
      setMessageType(type)
      setMessageOpen(true)
    }}></PanelTasks>}
  </Mui.Box>
}

export default GPTSoViTsMiddleware;