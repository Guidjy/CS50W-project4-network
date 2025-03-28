function App() {
  const [username, setUsername] = React.useState('Guidjy');
  const [loggedIn, setLoggedIn] = React.useState(true);


  return (
    <div>
      <Sidebar loggedIn={loggedIn} username={username}/>
    </div>
  );
}


function SidebarItem({ icon, label, onClick }) {
  return (
    <li>
      <div>
        {icon}
        <h2>{label}</h2>
      </div>
    </li>
  )
}


function Sidebar({loggedIn, username}) {
  console.log(loggedIn);
  return (
    <section id="sidebar">
      {/* Logo */}
      <div>
        <h1>Logo</h1>
      </div>
      <div>
        <ul>
          {/* Profile */}
          {loggedIn && (<SidebarItem
          icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>
          label = {username} 
          onCLick = ""
          /> )}
          {/* Home */}
          <SidebarItem
          icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16"><path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/></svg>
          label="Home" 
          onClick="" 
          />
          {/* Following */}
          {loggedIn && (<SidebarItem
          icon="" 
          label="Following"
          onCLick=""
          /> 
          )}
          {/* Log out, Log in and Register */}
          {loggedIn ? (
            <SidebarItem
            icon=""
            label="Log Out"
            onClick="" 
            />
          ) : (
            <>
              <SidebarItem
              icon=""
              label="Log In"
              onClick="" />
              <SidebarItem
              icon=""
              label="Register"
              onClick="" 
              />
            </>
          )}
        </ul>
      </div>
    </section>
  );
}


ReactDOM.render(<App />, document.querySelector('#app'));