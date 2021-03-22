export function getJobs() {
  return [
    'Developer',
    'Designer',
    'Writer'
  ]
}

export default (req, res) => {
  res.status(200).json(getJobs())
}
