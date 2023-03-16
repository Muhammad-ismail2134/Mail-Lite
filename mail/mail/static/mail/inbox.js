document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //submit the mail
  document.querySelector('#compose-form').addEventListener('submit', sent_mail);
  // By default, load the inbox
  load_mailbox('inbox');
  
});

function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#compose-view").style.display = "none";
    document.querySelector("#email-detail-view").style.display = "block";

    document.querySelector("#email-detail-view").innerHTML = `
    <ul id = "detail-list">
      <li><strong>From: </strong>${email.sender}</li>
      <li><strong>To: </strong>${email.recipients}</li>
      <li><strong>Subject: </strong>${email.subject}</li>
      <li><strong>Timestamp: </strong>${email.timestamp}</li>
    </ul>
    <hr>
    <p>${email.body}<p>
    
    `
    //The email is read
    if(!email.read)
    {
      fetch(`/emails/${email.id}` ,{
        method : 'PUT',
        body : JSON.stringify({
          read : true
        })
      });
    }
    //Archive and Unarchive
    const btn_arch = document.createElement('button');
    btn_arch.innerHTML = email.archived ? "Unarchived" : "Archive";
    btn_arch.className = email.archived ? " btn btn-success" : "btn btn-danger";
    btn_arch.addEventListener('click', ()=> {
      fetch(`/emails/${email.id}`, {
        method : 'PUT',
        body : JSON.stringify({
          archived : !email.archived 
        })
      })
      .then(()=> {
        load_mailbox('archive')
      }) 
    })
    document.querySelector('#email-detail-view').append(btn_arch);

    //Reply 
    const btn_reply = document.createElement('button');
    btn_reply.innerHTML = 'Reply';
    btn_reply.style.margin = '1.5rem 0';
    btn_reply.style.marginBottom = '0';
    btn_reply.className = 'btn btn-primary';
    //onclinking Reply button
    btn_reply.addEventListener('click', ()=> {
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      let subject  = email.subject;
      if(subject.split(' ',1)[0] != 'Re:'){
        subject = "Re: " + email.subject;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    });
    document.querySelector('#detail-list').append(btn_reply);
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#email-detail-view").style.display = "none";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Get the mail from mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(email => {
    //Apply div for each email
    email.forEach(SingleElement => {
      console.log(SingleElement);

      //Creating a div
      const element = document.createElement('div');
      element.className = "list-group-item";
      element.classList.add("listings"); 
      element.innerHTML = `
        <div class="container">
          <div class="row">
            <div class="col">
              <strong>${SingleElement.sender}</strong>
            </div>
            <div class="col-6">
              ${SingleElement.subject}
            </div>
            <div class="col light">
              ${SingleElement.timestamp}
            </div>
          </div>
      `;
      //Changing Background
      if(SingleElement.read)
        element.classList.add("read");
      else
        element.classList.add("unread");  
    
      element.addEventListener('click', function() {
        view_email(SingleElement.id);
      });
      document.querySelector('#emails-view').append(element);

      
 })
});

}

function sent_mail(event){
  event.preventDefault();
  event.stopImmediatePropagation(); 
 
  //Store data
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
 
  //Send data
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });

}