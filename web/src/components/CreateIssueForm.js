import React, { useState } from 'react'
import { Form, Button,ButtonToolbar,ButtonGroup, Modal } from 'react-bootstrap'
import LabelSelect from './labels/LabelSelect.js'
import CreateLabelForm from './labels/CreateLabelForm'

const CreateIssueForm = ( props ) => {
  const [title,setTitle]=useState([])
  const [description,setDescription]=useState([])
  const [colorlabel,setColorLabel]=useState([])
  const [smShow, setSmShow] = useState(false)

  const addIssue= ( event ) => {
    event.preventDefault()
    props.createIssue ({ title: title, description: description, labels:colorlabel })
    setTitle('')
    setDescription('')
  }

  function onChangeInput(value){
    if(value){
      setColorLabel(value.map(ıtem => ({ text:ıtem.label,color:ıtem.value })) )
    }
  }

  const styles={
    select:{
      width:'100%',
      maxWidth:600
    }
  }

  const handleClick= ( event ) => {
    event.preventDefault()
    props.setLabelSelect(true)
    setSmShow(true)
  }

  return (
    <div className="formDiv">
      <h2>Create a new issue</h2>
      <Form onSubmit={addIssue}>
        <Form.Group>
          <Form.Label>title:</Form.Label>
          <Form.Control
            required
            id="title"
            type="text"
            name="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
          <Form.Label>description:</Form.Label>
          <Form.Control
            required
            id="description"
            type="text"
            name="description"
            value={description}
            onChange={({ target }) => setDescription(target.value)}
          />
          <Form.Label>Labels:</Form.Label>
          <div>
            {props.option?<LabelSelect style={styles.select} option={props.option} isMulti={true}  onChange={onChangeInput}/>:''}
          </div>
          <ButtonToolbar aria-label="Toolbar with button groups">
            <ButtonGroup className="mr-2" aria-label="First group">
              < Button id="createButton" type="submit" variant="primary">create new issue</Button>
            </ButtonGroup>
            <ButtonGroup className="mr-2" aria-label="Second group">
              <Button variant="success"  onClick={handleClick}>create label</Button>
            </ButtonGroup>
          </ButtonToolbar>
        </Form.Group>
      </Form>
      <Modal
        size="sm"
        show={smShow}
        onHide={() => setSmShow(false)}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-sm">
            Create New Label
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateLabelForm setLabelSelect={props.setLabelSelect} labelSelect={props.labelSelect} addLabel={props.addLabel}
            setSmShow={setSmShow}/>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default CreateIssueForm
