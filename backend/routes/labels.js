const router = require('express').Router()
const Label = require('../models/label.model')
const Issue = require('../models/issue.model')
const { objCleaner, checkToken, existanceError } = require('../utils/utils')
require('express-async-errors')

router.route('/').post(async (req, res) => {
  checkToken(req)
  const label = new Label({
    text:req.body.text,
    color:req.body.color
  })
  const savedLabel = await label.save()
  return res.status(201).json(savedLabel)
})

router.route('/all').get((req, res) => {
  Label.find()
    .then(labels => res.json(labels))
    .catch(err => res.status(400).json({ error:err }))
})

router.route('/:id').put(async (req, res) => {
  checkToken(req)
  let labelToChange = await Label.findById(req.params.id)
  if (existanceError({ label:labelToChange }, res)) return

  const newLabel = {
    text:req.body.text,
    color:req.body.color
  }
  objCleaner(newLabel)
  const check = await Label.validate(newLabel).catch(() => {
    return res.status(400).json({ error:'Validation exception' }).end()
  })
  if (!check){
    const updatedLabel = await Label.findByIdAndUpdate(req.params.id, newLabel, { new:true })
    return res.status(200).json(updatedLabel)
  }
})

router.route('/:id').delete(async (req, res) => {
  checkToken(req)
  const label = await Label.findById(req.params.id)
  if (existanceError({ label }, res)) return
  const relatedIssues = await Issue.find({
    labels: { $elemMatch: { $eq:req.params.id } }
  })
  relatedIssues.forEach( async (issue) => {
    issue.labels = issue.labels.filter( l => l.id !== req.params.id)
    await Issue.findByIdAndUpdate(issue._id, issue)
  })
  await Label.findByIdAndRemove(req.params.id)
  return res.status(200).json({ OK:'successfull operation' })
})

module.exports = router
