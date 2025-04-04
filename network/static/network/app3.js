function App() {
  const [username, setUsername] = React.useState(null);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [displayAlert, setDisplayAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');

  // updates the client side with user info
  // uuuuuuhh peep https://react.dev/reference/react/useEffect 
  React.useEffect(() => {
    fetch('/get_current_user')
    .then(response => response.json())
    .then(user => {
      console.log(user);
      if (user.isLoggedIn) {
        setUsername(user.username);
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });
  }, []);

  // handles logout logic :P
  function logout() {
    fetch('/logout')
    .then(response => response.json())
    .then(response => {
      if (response.status === 200) {
        setLoggedIn(false);
      }
    });
  }

  // handles login logic :P
  function login(username, password) {
    fetch('/login', {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(response => response.json())
    .then(response => {
      // checks wether the user was successfully logged in or not
      if(response.status === 200) {
        setUsername(username);
        setLoggedIn(true);
        setDisplayAlert(false);
      } else {
        setLoggedIn(false);
        setDisplayAlert(true);
        setAlertMessage(response.message);
      }
    })
  }

  function register() {
    // TODO
  }

  return (
    <div className="flex">
      <SidebarLeft loggedIn={loggedIn} username={username} onLogout={logout} onLogin={login} />
      {/* this div is here to place the posts div correctly */}
      <div className="w-1/4"></div>
      <div id="posts" className="w-3/4 xl:w-6/12 min-h-screen h-full xl:border-r-2 border-[#023E73]">
        {displayAlert && (<Alert message={alertMessage} />)}
        {!loggedIn && (<LoginForm onSubmit={login} />)}
      </div>
    </div>
  );
}


function Alert({message}) {
  return (
    <div class="bg-[#F24B59] border-2 border-[#BF3434] rounded text-center font-bold p-3 m-5">
      {message}
    </div>
  );
}


function SidebarItem({ icon, label, onClick }) {
  return (
    <li>
      {/* the question mark after onClick makes it so that it is only called if it exists... React syntax is sum else */}
      <a href=" " onClick={(event) => {event.preventDefault(); onClick?.(); }}>
        <div className="flex items-center pb-6">
          {icon}
          <h2 className="text-4xl hidden xl:block ps-4">{label}</h2>
        </div>
      </a>
    </li>
  )
}


function SidebarLeft({loggedIn, username, onLogout, onLogin}) {
  return (
    <section id="sidebar" className="w-1/4 h-screen fixed border-r-2 border-[#023E73] flex justify-end xl:justify-start pt-5 pe-8 xl:ps-5">
      <div className="flex flex-col items-center xl:items-start">
        {/* Logo */}
        <div className="flex items-center pb-8 ">
          <img className="h-16 xl:h-24" src="/static/network/assets/logo.png" />
          <h1 className="text-6xl hidden xl:block ps-4">Network</h1>
        </div>
        <div>
          <ul>
            {/* Profile */}
            {loggedIn && (<SidebarItem
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>
            label = {username} 
            onCLick = ""
            /> )}
            {/* Home */}
            <SidebarItem
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16"><path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/></svg>
            label="Home" 
            onClick=''
            />
            {/* Following */}
            {loggedIn && (<SidebarItem
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-person-heart" viewBox="0 0 16 16"><path d="M9 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h10s1 0 1-1-1-4-6-4-6 3-6 4m13.5-8.09c1.387-1.425 4.855 1.07 0 4.277-4.854-3.207-1.387-5.702 0-4.276Z"/></svg>
            label="Following"
            onCLick=""
            /> 
            )}
            {/* Log out, Log in and Register */}
            {loggedIn ? (
              <SidebarItem
              icon = <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-box-arrow-left" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/><path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/></svg>
              label="Log Out"
              onClick = {onLogout}
              />
            ) : (
              <>
                <SidebarItem
                icon = <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/><path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/></svg>
                label="Log In"
                onClick={onLogin} 
                />
                <SidebarItem
                icon=<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>
                label="Register"
                onClick="" 
                />
              </>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}


function LoginForm({onSubmit}) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <div className="m-5 py-15 bg-[#1D0259] rounded-lg">
      <form class="flex flex-col items-center">
        {/* peep the onChange events in the input fields. The idea is to prevent calling document.querySelector
        which should probably make things easier in bigger forms idk :P */}
        <input id="login-username-field" class="text-center rounded-md bg-[#060126] mb-7 py-2 w-3/4" type="text" placeholder="Username" autoFocus 
        onChange={(event) => setUsername(event.target.value)}/>
        <input id="login-password-field" class="text-center rounded-md bg-[#060126] mb-7 py-2 w-3/4" type="password" placeholder="Password" 
        onChange={(event) => setPassword(event.target.value)}/>
        <input class="bg-[#0455BF] rounded-md hover:bg-[#3084F2] py-2 w-1/2" type="submit" value="Login"
        onClick={(event) => {event.preventDefault(); onSubmit?.(username, password); }} />
      </form>
    </div>
  )
}


ReactDOM.render(<App />, document.querySelector('#app'));