import React from 'react';
import icons from '../shared/icons';
import mui from '../shared/mui';
import * as Api from '../shared/remote';
import Message from '../components/Message';

function NotConfigured() {
  return <mui.Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
    <mui.Typography variant="h5" style={{ marginTop: 20 }}>
      GPT-SoViTs Middleware Not Configured
    </mui.Typography>
    <mui.Typography variant="body1" style={{ marginTop: 10 }}>
      {"You may go to More -> Settings -> GPT-SoViTs Middleware API URL to add a GPT-SoViTs middleware API URL."}
    </mui.Typography>
    <mui.Typography variant="body1" style={{ marginTop: 10 }}>
      A GPT-SoViTs middleware is the web interface of AIDub that integrated one-key voice dataset preprocessing and voice model training,
      which can significantly reduce the workload of data preparation and model training for users.
    </mui.Typography>
  </mui.Box>
}


function AddNewCharacterDialog({ open, onOk, onErr, onClose }) {
  const [names, setNames] = React.useState([]);
  const [editingName, setEditingName] = React.useState('');
  const [sourcesToFetch, setSourcesToFetch] = React.useState([]);
  const [editingSource, setEditingSource] = React.useState(null);

  return <mui.Dialog open={open} onClose={onClose}>
    <mui.DialogTitle>Add New Character</mui.DialogTitle>
    <mui.DialogContent sx={{ minWidth: '40vw' }}>
      <div style={{ marginTop: 10 }}></div>
      <mui.TextField fullWidth label="Character Name" value={editingName} onChange={(e) => setEditingName(e.target.value)}></mui.TextField>
      <mui.Button
        onClick={() => {
          if (editingName) {
            setSourcesToFetch([...sourcesToFetch, editingName])
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
      </mui.Button>
      <mui.List sx={{ maxHeight: 100, overflowY: 'scroll' }}>
        {sourcesToFetch.map((source, index) => <mui.ListItem key={index}>
          <mui.ListItemText primary={source} />
          <mui.IconButton onClick={() => {
            setNames(names.filter((_, i) => i !== index))
            setEditingName(null)
          }}><icons.Delete /></mui.IconButton>
        </mui.ListItem>)}
      </mui.List>
      <mui.Box style={{ marginTop: 10 }}>
        <mui.TextField
          fullWidth
          value={editingSource}
          onChange={(e) => setEditingSource(e.target.value)}
          label="Sources to Fetch"
          placeholder="Enter source URL"
          style={{ marginTop: 5 }}
        ></mui.TextField>
        <mui.Button
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
        </mui.Button>
        <mui.List sx={{ maxHeight: 100, overflowY: 'scroll' }}>
          {sourcesToFetch.map((source, index) => <mui.ListItem key={index}>
            <mui.ListItemText primary={source} />
            <mui.IconButton onClick={() => {
              setSourcesToFetch(sourcesToFetch.filter((_, i) => i !== index))
              setEditingSource(null)
            }}><icons.Delete /></mui.IconButton>
          </mui.ListItem>)}
        </mui.List>
      </mui.Box>
    </mui.DialogContent>
    <mui.DialogActions>
      <mui.Button onClick={() => {
        onClose()
      }}>Cancel</mui.Button>
      <mui.Button onClick={() => {
        onOk({ name, sourcesToFetch })
        onClose()
      }} disabled={!name || sourcesToFetch.length === 0}>Add</mui.Button>
    </mui.DialogActions>
  </mui.Dialog>
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

  return <>{taskId && <mui.Dialog open={open} onClose={() => {
    if (refresher) {
      clearInterval(refresher)
    }
    onClose()
  }}>
    <mui.DialogTitle>
      Task #{taskId} details
    </mui.DialogTitle>
    <mui.DialogContent>
      <mui.Grid container spacing={1} alignItems={'center'} justifyContent={'center'}>
        <mui.Grid item xs={12} sm={12}>
          <mui.LinearProgress variant="determinate" value={(task.stagesDescription.current_stage) / task.stagesDescription.total_stages.length * 100} />
        </mui.Grid>
        <mui.Grid item xs={12} sm={6}>
          <mui.Typography color='text.primary'>Begin Time: </mui.Typography>
          <mui.Typography color='text.secondary'>{task.creationTime}</mui.Typography>
        </mui.Grid>
        <mui.Grid item xs={12} sm={6}>
          <mui.Typography color='text.primary'>End Time: </mui.Typography>
          <mui.Typography color='text.secondary'>{task.completionTime}</mui.Typography>
        </mui.Grid>
        <mui.Grid item xs={12} sm={6}>
          <mui.Typography color='text.primary'>Current Stage: </mui.Typography>
          <mui.Typography color='text.secondary'>{task.stagesDescription.current_stage}: {task.stagesDescription.total_stages[task.stagesDescription.current_stage - 1]}</mui.Typography>
        </mui.Grid>
        <mui.Grid item xs={12} sm={6}>
          <mui.Typography color='text.primary'>Status: </mui.Typography>
          <mui.Typography color='text.secondary'>{task.status}</mui.Typography>
        </mui.Grid>
        <mui.Grid item xs={12}>
          <mui.TextField
            fullWidth
            label="Log text"
            multiline
            rows={8}
            value={task.log}
          />
        </mui.Grid>
      </mui.Grid>
    </mui.DialogContent>
    <mui.DialogActions>
      <mui.Button onClick={() => {
        if (refresher) {
          clearInterval(refresher)
        }
        onClose()
      }}>Close</mui.Button>
    </mui.DialogActions>
  </mui.Dialog>}</>
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
  return <mui.Box style={{ height: '100%', overflowY: 'scroll' }}>
    <mui.Typography variant="body1" style={{ marginTop: 10 }}>
      A GPT-SoViTs middleware is the web interface of AIDub that integrated one-key voice dataset preprocessing and voice model training,
      which can significantly reduce the workload of data preparation and model training for users.
    </mui.Typography>
    <div style={{ marginTop: 20 }}></div>
    <mui.Box sx={{ paddingRight: 10 }}>
      {tableContent.map((item, index) => <mui.Accordion>
        <mui.AccordionSummary>
          <mui.Typography sx={{ width: '33%', flexShrink: 0 }}>{item.name}</mui.Typography>
          <mui.Typography sx={{ color: 'text.secondary' }}>
            #{index + 1}
          </mui.Typography>
        </mui.AccordionSummary>
        <mui.AccordionDetails>
          <mui.Box>
            <mui.Typography variant="body1" style={{ marginTop: 10 }}>
              GPT model path: {item.paths[0]}
            </mui.Typography>
          </mui.Box>
          <mui.Box>
            <mui.Typography variant="body1" style={{ marginTop: 10 }}>
              SoVITs model path: {item.paths[1]}
            </mui.Typography>
          </mui.Box>
        </mui.AccordionDetails>
      </mui.Accordion>)}
      <div style={{ marginTop: 20 }}></div>
    </mui.Box>
    <mui.Fab sx={{
      position: 'fixed',
      bottom: 16,
      right: 16,
    }} color="primary" onClick={(e) => {
      setAddNewCharacterOpen(true)
    }}>
      <icons.MoreVert />
    </mui.Fab>
    <AddNewCharacterDialog
      open={addNewCharacterOpen}
      onOk={(data) => {
        Api.runTraining([data.name], data.sourcesToFetch).then(r => {
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
  </mui.Box>
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

  return <mui.Box style={{ height: '100%', overflowY: 'scroll' }}>
    <mui.Typography variant="body1" style={{ marginTop: 10 }}>
      Check all training tasks on GPT-SoViTs middleware.
    </mui.Typography>
    <div style={{ marginTop: 20 }}></div>
    <mui.TableContainer>
      <mui.Table>
        <mui.TableHead>
          <mui.TableRow>
            <mui.TableCell>Task ID</mui.TableCell>
            <mui.TableCell>Status</mui.TableCell>
            <mui.TableCell>Progress</mui.TableCell>
            <mui.TableCell>Begin Time</mui.TableCell>
            <mui.TableCell>Actions</mui.TableCell>
          </mui.TableRow>
        </mui.TableHead>
        <mui.TableBody>
          {tasks.map((task, index) => <mui.TableRow key={index}>
            <mui.TableCell>{task.id}</mui.TableCell>
            <mui.TableCell>{task.status}</mui.TableCell>
            <mui.TableCell>{task.stagesDescription.current_stage} / {task.stagesDescription.total_stages.length}</mui.TableCell>
            <mui.TableCell>{task.creationTime}</mui.TableCell>
            <mui.TableCell>
              <mui.IconButton onClick={() => {
                setTaskViewId(task.id)
                setTaskViewOpen(true)
              }}><icons.Info color="primary" /></mui.IconButton>
              <mui.IconButton onClick={() => {
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
              }}><icons.Delete color="primary" /></mui.IconButton>
            </mui.TableCell>
          </mui.TableRow>)}
        </mui.TableBody>
      </mui.Table>
    </mui.TableContainer>
    <TaskViewDialog taskId={taskViewId} open={taskViewOpen} onClose={() => {
      setTaskViewOpen(false)
    }} raiseMessage={raiseMessage}></TaskViewDialog>
  </mui.Box>
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
  return <mui.Box sx={{ height: 'calc(100% - 48px)', width: 'calc(100% - 30px)', marginLeft: 30 }}>
    <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)}></Message>
    {middlewareInfo === {} && <NotConfigured></NotConfigured>}
    {middlewareInfo !== {} && <mui.Tabs value={currentPanel} onChange={setCurrentPanel} aria-label="basic tabs example">
      <mui.Tab label="Models" value="models" onClick={() => {
        setCurrentPanel('models')
      }}></mui.Tab>
      <mui.Tab label="Tasks" value="tasks" onClick={() => {
        setCurrentPanel('tasks')
      }}></mui.Tab>
    </mui.Tabs>}
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
  </mui.Box>
}

export default GPTSoViTsMiddleware;