window.onload = () => {
  // load in the list of pages that a user can select
  axios.get('/get-page-list').then((res) => {
    if(res.status === 200){
      // parse data for only title and id
      const data = res.data.results
      const parsedData = data.map((x) => {
        const titles = x.properties.title.title
        return {
          id: x.id,
          title: titles.length > 0 ? titles[0].plain_text : ""
        }
      })

      // add page options to the form
      parsedData.forEach((x) => {
        const option = document.createElement('option')
        option.innerHTML = x.title
        option.setAttribute('value', x.id)
        document.getElementById('notes').appendChild(option)
      })
    } else {
      document.getElementById('message').innerHTML = "An error was made fetching pages"
      console.log(res)
    }
  })

  // handle form submission
  document.getElementById('generation-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      notes_id: formData.get('notes')
    }
    console.log(data)
  })
}

