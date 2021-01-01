const supertest = require('supertest')
const mongoose = require('mongoose')
const { replSet } = require('../mongodb')
const { testLabels, labelsInDb, nonExistingLabelId } = require('./test_helper')
const app = require('../server')
const api = supertest(app)
const Label = require('../models/label.model')

beforeEach(async () => {
  await Label.deleteMany({})
  const labelObjects = testLabels.map(el => new Label(el))
  const promiseArray = labelObjects.map(el => el.save())
  await Promise.all(promiseArray)
  //console.log(promiseArray)
})

describe('When there is initially some labels saved', () => {
  describe('|: GET-/label/all :|', () => {
    test('labels are returned as json with status 200', async () => {
      await api
        .get('/label/all')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    test('all labels are returned', async () => {
      const response = await api.get('/label/all')
      expect(response.body.length).toBe(testLabels.length)
    })
    test('a specific label is within the returned labels', async () => {
      const response = await api.get('/label/all')
      const contents = response.body.map(r => r.text)
      expect(contents).toContain(
        'frontend-2'
      )
    })
  })

  describe('|: POST-/label :| - adding of a new label', () => {
    test('succeeds with valid data with status 201, json aplication', async () => {
      const initialLabels = await labelsInDb()
      const newLabels = {
        text: 'A text',
        color: '#606060'
      }
      await api
        .post('/label')
        .send(newLabels)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const labelsAtEnd = await labelsInDb()
      expect(labelsAtEnd.length).toBe(initialLabels.length + 1)
      const contents = labelsAtEnd.map(n => n.text)
      expect(contents).toContain(
        'A text'
      )
    })
    test('fails if data invalid, with status code 400, error:Validation exception', async () => {
      const newLabel = {
        imp: true
      }
      const errorMessage = await api
        .post('/label')
        .send(newLabel)
        .expect(400)
      const labelsAtEnd = await labelsInDb()
      expect(errorMessage.text).toBe('Validation exception')
      expect(labelsAtEnd.length).toBe(testLabels.length)
    })
    test('fails when label already exist, with status code 409, error:Label already exist', async () => {
      const labelsAtStart = await labelsInDb()
      const labelToAdd = labelsAtStart[0]
      const res = await api
        .post('/label')
        .send(labelToAdd)
        .expect(409)
      expect(res.text).toBe('Label already exist')
    })
  })

  describe('|: PUT-/label/:id :| - updating a label', () => {
    test('succeeds to update with a valid id with status 200, application json', async () => {
      const labelsAtStart = await labelsInDb()
      const labelToUpdate = labelsAtStart[0]
      const newText = 'new Text jfhıfjhbkfdvjknl'
      labelToUpdate.text = newText
      const resultLabel = await api
        .put(`/label/${labelToUpdate.id}`)
        .send(labelToUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(JSON.parse(JSON.stringify(resultLabel.body)).text)
        .toEqual(JSON.parse(JSON.stringify(labelToUpdate)).text)
    })
    test('fails if id is invalid, with statuscode 400, error:Invalid ID supplied', async () => {
      const invalidId = '5a3da82a3445'
      const res = await api
        .put(`/label/:${invalidId}`)
        .expect(400)
      expect(res.text).toBe('Invalid ID supplied')
    })
    test('fails if label does not exist, with statuscode 404, error:Label not found', async () => {
      const validNonexistingId = await nonExistingLabelId()
      const res = await api
        .put(`/label/${validNonexistingId}`)
        .expect(404)
      expect(res.text).toBe('Label not found')
    })
    test('fails if sent unvalid data, with statuscode 405, error:Validation exception', async () => {
      const labelsAtStart = await labelsInDb()
      const labelToUpdate = labelsAtStart[0]
      const res = await api
        .put(`/label/${labelToUpdate.id}`)
        .send({ 'asd':'value' })
        .expect(405)
      expect(res.text).toBe('Validation exception')
    })
  })

  describe('|: DELETE-/label/:id :| - deletion of a label', () => {
    test('succeeds to delete if id is valid with status code 200', async () => {
      const labelsAtStart = await labelsInDb()
      const labelToDelete = labelsAtStart[0]
      await api
        .delete(`/label/${labelToDelete.id}`)
        .expect(200)
      const labelsAtEnd = await labelsInDb()
      expect(labelsAtEnd.length).toBe(
        labelsAtStart.length - 1
      )
      const texts = labelsAtEnd.map(r => r.text)
      expect(texts).not.toContain(labelToDelete.text)
    })
    test('fails when invalid id, with status 400, error:Invalid ID supplied', async () => {
      const res = await api
        .delete('/label/fd..u54')
        .expect(400)
      expect(res.text).toBe('Invalid ID supplied')
    })
    test('fails with statuscode 404 if label does not exist', async () => {
      const validNonexistingId = await nonExistingLabelId()
      await api
        .get(`/label/${validNonexistingId}`)
        .expect(404)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
  replSet.stop()
})
