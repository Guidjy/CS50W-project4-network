function App() {
  const [username, setUsername] = React.useState(null);
  const [pfp, setPfp] = React.useState(null);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [displayNewPostForm, setDisplayNewPostForm] = React.useState(true);
  const [displayLoginForm, setDisplayLoginForm] = React.useState(false);
  const [displayRegisterForm, setDisplayRegisterForm] = React.useState(false);
  const [displayAlert, setDisplayAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState('home');
  const [newPostMade, setNewPostMade] = React.useState(false);

  // updates the client side with user info
  // uuuuuuhh peep https://react.dev/reference/react/useEffect 
  React.useEffect(() => {
    fetch('/get_current_user')
    .then(response => response.json())
    .then(user => {
      if (user.isLoggedIn) {
        setUsername(user.username);
        setPfp(user.pfp)
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
        setDisplayLoginForm(false);
      } else {
        setLoggedIn(false);
        setDisplayAlert(true);
        setAlertMessage(response.message);
        setDisplayLoginForm(true);
      }
    })
}

  function register(username, email, password, confirmation) {
    fetch('/register', {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        confirmation: confirmation
      })
    })
    .then(response => response.json())
    .then(response => {
      // checks wether the user was successfully registered or not
      if (response.status === 200) {
        login(username, password);
        setDisplayAlert(false);
        setDisplayRegisterForm(false);
      } else {
        setDisplayAlert(true);
        setAlertMessage('Failed to register user. Please try again.');
        setDisplayRegisterForm(true);
      }
    })
  }

  function newPost(content, image) {
    // https://developer.mozilla.org/en-US/docs/Web/API/FormData
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    console.log(formData);

    fetch('/new_post', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(response => {
      // "fires a signal" to re-render the posts
      setNewPostMade(true);
    });
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    if (page === 'profile') {
      setDisplayNewPostForm(false);
    } else {
      setDisplayNewPostForm(true);
    }
  }
  

  return (
    <div className="flex">
      <SidebarLeft loggedIn={loggedIn} username={username} onLogout={logout} onLogin={() => {setDisplayLoginForm(true); setDisplayRegisterForm(false);}}
      onRegister={() => {setDisplayLoginForm(false); setDisplayRegisterForm(true);}} onPageChange={handlePageChange} />
      {/* this div is here to place the posts div correctly */}
      <div className="w-1/4"></div>
      <div id="posts" className="w-3/4 xl:w-6/12 min-h-screen h-full xl:border-r-2 border-[#424549]">
        {displayAlert && (<Alert message={alertMessage} />)}
        {displayLoginForm && (<LoginForm onSubmit={login} />)}
        {displayRegisterForm && (<RegisterForm onSubmit={register} />)}
        {loggedIn && displayNewPostForm && (<NewPostForm pfp={pfp} onSubmit={newPost} />)}
        <Feed currentPage={currentPage} currentUser={username} onPageChange={handlePageChange} newPostMade={newPostMade} />
      </div>
    </div>
  );
}


function Alert({message}) {
  return (
    <div class="bg-[#F24B59] border-2 border-[#BF3434] rounded text-center font-bold p-3 mx-5 mt-10">
      {message}
    </div>
  );
}


function SidebarItem({ icon, label, onClick }) {
  return (
    <li className="bg-[rgba(66,69,73,0)] hover:bg-[rgba(66,69,73,1)] transition-colors duration-200 rounded-full py-2 px-4">
      {/* the question mark after onClick makes it so that it is only called if it exists... React syntax is sum else */}
      <a href=" " onClick={(event) => {event.preventDefault(); onClick?.(); }}>
        <div className="flex items-center">
          {icon}
          <h2 className="text-4xl hidden xl:block ps-4">{label}</h2>
        </div>
      </a>
    </li>
  )
}


function SidebarLeft({loggedIn, username, onLogout, onLogin, onRegister, onPageChange}) {
  return (
    <section id="sidebar" className="w-1/4 h-screen fixed border-r-2 border-[#424549] flex justify-end xl:justify-start pt-5 pe-8 xl:ps-5">
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
            onClick = {() => onPageChange('profile')}
            /> )}
            {/* Home */}
            <SidebarItem
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16"><path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/></svg>
            label="Home" 
            onClick = {() => onPageChange('home')}
            />
            {/* Following */}
            {loggedIn && (<SidebarItem
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-person-heart" viewBox="0 0 16 16"><path d="M9 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h10s1 0 1-1-1-4-6-4-6 3-6 4m13.5-8.09c1.387-1.425 4.855 1.07 0 4.277-4.854-3.207-1.387-5.702 0-4.276Z"/></svg>
            label="Following"
            onClick= {() => onPageChange('following')}
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
                onClick={onRegister}
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
    <div className="py-15 border-b-2 border-[#424549]">
      <form class="flex flex-col items-center">
        {/* peep the onChange events in the input fields. The idea is to prevent calling document.querySelector
        which should probably make things easier in bigger forms idk :P */}
        <input class="text-center rounded-md bg-[#424549] mb-7 py-2 w-3/4" type="text" placeholder="Username" autoFocus 
        onChange={(event) => setUsername(event.target.value)}/>
        <input class="text-center rounded-md bg-[#424549] mb-7 py-2 w-3/4" type="password" placeholder="Password" 
        onChange={(event) => setPassword(event.target.value)}/>
        <input class="bg-[#1DA1F2] rounded-md hover:bg-[#1d8ff2] py-2 w-1/2" type="submit" value="Login"
        onClick={(event) => {event.preventDefault(); onSubmit?.(username, password); }} />
      </form>
    </div>
  )
}


function RegisterForm({onSubmit}) {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');

  return (
    <div className="py-15 border-b-2 border-[#424549]">
      <form class="flex flex-col items-center">
        {/* peep comment on LoginForm if confused about the onChange events */}
        <input class="text-center rounded-md bg-[#424549] mb-7 py-2 w-3/4" type="text" placeholder="Username" autoFocus 
        onChange={(event) => setUsername(event.target.value)}/>
        <input class="text-center rounded-md bg-[#424549] mb-7 py-2 w-3/4" type="email" placeholder="Email"
        onChange={(event) => setEmail(event.target.value)}/>
        <input class="text-center rounded-md bg-[#424549] mb-7 py-2 w-3/4" type="password" placeholder="Password" 
        onChange={(event) => setPassword(event.target.value)}/>
        <input class="text-center rounded-md bg-[#424549] mb-7 py-2 w-3/4" type="password" placeholder="Password Confirmation" 
        onChange={(event) => setConfirmation(event.target.value)}/>
        <input class="bg-[#1DA1F2] rounded-md hover:bg-[#1d8ff2] py-2 w-1/2" type="submit" value="Register"
        onClick={(event) => {event.preventDefault(); onSubmit?.(username, email, password, confirmation); }} />
      </form>
    </div>
  )
}


function NewPostForm({pfp, onSubmit}) {
  const [content, setContent] = React.useState('');
  const [image, setImage] = React.useState('');
  const [imageURL, setImageURL] = React.useState('');

  function handleImageDrop(event) {
    event.preventDefault();
    // peep: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/files
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const imageUrl = URL.createObjectURL(file);
      setImageURL(imageUrl);
    }
  }

  function removeImage() {
    setImage('');
    setImageURL('');
  }

  function cleanForm() {
    if (image != '') {
      removeImage();
    }
    document.querySelector('#post-content').value = '';
    setContent('');
  }


  return (
    <>
      <div onDrop={handleImageDrop} id="new-post-section" className="flex flex-col items-end border-b-2 border-[#424549]">
        <div class="flex w-full p-4">
          <img src={pfp} className="rounded-full h-18 mb-2 me-4 hidden lg:block" />
          <textarea id="post-content" placeholder="What's happening?" className="resize-none focus:outline-none w-full h-48 lg:h-32" maxLength="280" 
          onChange={(event) => setContent(event.target.value)}/>
        </div>
        <div className="flex justify-center w-full">
          {image != '' && (<img id="post-image" src={imageURL} className="h-96 rounded-xl mb-4" />)}
        </div>
        <div className="flex items-center me-8 mb-4">
          {image != '' && (
            <button className="me-6 group" onClick={removeImage}>
              <div className="flex items-center">
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 me-3 bg-[#424549] px-3 py-1 rounded-lg">Remove image</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-image-fill text-[#1DA1F2] hover:text-[#1d8ff2]" viewBox="0 0 16 16">
                  <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
                </svg>
              </div>
            </button>      
          )}
          <button type="submit" className="px-4 py-2 bg-[#1DA1F2] hover:bg-[#1d8ff2] rounded-3xl" 
          onClick={(event) => {event.preventDefault(); cleanForm(); onSubmit?.(content, image); }}>Post</button>
        </div>
      </div>
    </>
  )
}


function Post({currentUser, postId, pfp, username, content, imageUrl, likes, onUsernameClick, date, time}) {
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(likes);
  const [editingPost, setEditingPost] = React.useState(false);

  function handleLike() {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  }

  function enablePostEdit() {
    if (editingPost) {
      setEditingPost(false);
    } else {
      setEditingPost(true);
    }
  }

  function editPost(newContent) {
    fetch(`edit_post/${postId}`, {
      method: 'PATCH',
      body: newContent
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    });
  }


  return (
    <>
    <div key={postId} className="flex flex-col border-b-2 border-[#424549] p-5">
      {/*username, pfp and datetime posted*/}
      <div className="flex mb-2 w-full">
        <div className="flex mb-2 w-1/2 justify-start">
          <img src={pfp} className="rounded-full h-16 me-2" />
          <a href="" onClick={(event) => {event.preventDefault(); onUsernameClick(username);}} className="text-xl">{username}</a>
        </div>
        <div className="flex flex-col mb-2 mt-1 w-1/2 items-end">
          <p className="text-gray-400 mb-2">{date} - {time}</p>
          {currentUser === username && (<button onClick={enablePostEdit} className="bg-[#1DA1F2] hover:bg-[#1d8ff2] px-2 rounded-xl">Edit</button>)}
        </div>
      </div>
      {/*content*/}
      {editingPost ? (
        <EditPostForm author={username} postId={postId} content={content} onSave={editPost} />
      ) : 
        <div className="flex flex-col mb-2">
          <p>{content}</p>
        </div> 
      }
      {/*image and likes*/}
      <div className="flex justify-center">
        <div className="flex flex-col items-end">
          {imageUrl && imageUrl != '' && (
            <img src={imageUrl} width="480" className="rounded-lg mb-2" />
          )}
          {!imageUrl && (
            <div className="w-96 mb-2 xl:me-24"></div>
          )}
          {!liked && (
            <div className="flex items-center">
              <span className="me-1">{likeCount}</span>
              <button onClick={handleLike}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                </svg>
              </button>
            </div>
          )}
          {liked && (
            <div className="flex items-center">
              <span className="me-1">{likeCount}</span>
              <button onClick={handleLike}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}


function EditPostForm({author, postId, content, onSave}) {
  const [newContent, setNewContent] = React.useState(content);

  return (
    <>
      <div className="flex flex-col w-full items-end mb-2">
        <textarea id="post-content" value={newContent} className="mb-2 bg-[#424549] rounded-xl resize-none focus:outline-none w-full h-48 lg:h-32" maxLength="280"
        onChange={(event) => setNewContent(event.target.value)} />
        <button onClick={() => onSave(newContent)} className="bg-[#1DA1F2] hover:bg-[#1d8ff2] px-2 rounded-xl">Save</button>
      </div>
    </>
  )
}


function Feed({ currentPage, currentUser, onPageChange, newPostMade }) {
  const [posts, setPosts] = React.useState([]);
  const [profileClicked, setProfileClicked] = React.useState(currentUser);
  const [targetUser, setTargetUser] = React.useState(null);
  const [userOwnsProfile, setUserOwnsProfile] = React.useState(false);
  const [paginationNumber, setPaginationNumber] = React.useState(0);
  const [paginationHasPrevious, setPaginationHasPrevious] = React.useState(false);
  const [paginationHasNext, setPaginationHasNext] = React.useState(false);

  React.useEffect(() => {
    setPaginationNumber(0);
    switch (currentPage) {
      case 'home':
        fetch('/all_posts')
          .then(response => response.json())
          .then(data => {
            setTargetUser(null);
            setPaginationHasPrevious(data.pages[paginationNumber].hasPrevious);
            setPaginationHasNext(data.pages[paginationNumber].hasNext);
            setPosts(data.pages[paginationNumber].posts);
          });
        break;
      
      case 'profile':
        fetch(`/profile_page/${profileClicked}`)
        .then(response => response.json())
        .then(data => {
          setTargetUser(data.targetUser);
          setUserOwnsProfile(data.userOwnsProfile);
          setPaginationHasPrevious(data.pages[paginationNumber].hasPrevious);
          setPaginationHasNext(data.pages[paginationNumber].hasNext);
          setPosts(data.pages[paginationNumber].posts);
        });
        break;
      
      case 'following':
        fetch('/following')
        .then(response => response.json())
        .then(data => {
          setTargetUser(null);
          setPaginationHasPrevious(data.pages[paginationNumber].hasPrevious);
          setPaginationHasNext(data.pages[paginationNumber].hasNext);
          setPosts(data.pages[paginationNumber].posts);
        });
        break;
      
      default:
        break;
    }    
  // reruns when currentPage or newPostMade is updated
  }, [currentPage, newPostMade]);

  React.useEffect(() => {
    setProfileClicked(currentUser);
  }, [currentUser]);

  function handleProfileClick(username) {
    console.log('0-0');
    setProfileClicked(username);
    onPageChange('profile');
  }

  function handlePaginationChange(action) {
    console.log('paginatijn change');
    if (action === 'forward') {
      if (paginationHasNext) {
        setPaginationNumber(paginationNumber + 1);
      }
    } else {
      if (paginationHasPrevious) {
        setPaginationNumber(paginationNumber - 1);
      }
    }
    // I was fetching the next/previous page in this function but it took 2 clicks to change
    // pages and my states were getting out of control so I added "paginationNumber" to the
    // useEffect bellow
  }

  React.useEffect(() => {
    switch (currentPage) {
      case 'home':
        fetch('/all_posts')
          .then(response => response.json())
          .then(data => {
            setTargetUser(null);
            setPaginationHasPrevious(data.pages[paginationNumber].hasPrevious);
            setPaginationHasNext(data.pages[paginationNumber].hasNext);
            setPosts(data.pages[paginationNumber].posts);
          });
        break;
      
      case 'profile':
        fetch(`/profile_page/${profileClicked}`)
        .then(response => response.json())
        .then(data => {
          console.log(data.pages);
          setTargetUser(data.targetUser);
          setUserOwnsProfile(data.userOwnsProfile);
          setPaginationHasPrevious(data.pages[paginationNumber].hasPrevious);
          setPaginationHasNext(data.pages[paginationNumber].hasNext);
          setPosts(data.pages[paginationNumber].posts);
        });
        break;

      case 'following':
        fetch('/following')
        .then(response => response.json())
        .then(data => {
          setTargetUser(null);
          setPaginationHasPrevious(data.pages[paginationNumber].hasPrevious);
          setPaginationHasNext(data.pages[paginationNumber].hasNext);
          setPosts(data.pages[paginationNumber].posts);
        });
        break;


      default:
        break;
    }    
  }, [paginationNumber]);


  return (
    <>
      {targetUser && (
        <UserProfileHeader
        followerCount={targetUser.followerCount}
        followingCount={targetUser.followingCount}
        username={targetUser.username}
        pfp={targetUser.profile_picture}
        banner={targetUser.banner_picture}
        currentUser={currentUser}
        userOwnsProfile={userOwnsProfile}
        />
      )}
      {posts.length > 0 && posts.map((post) => (
        <Post
        currentUser={currentUser}
        postId={post.id} 
        pfp={post.author.pfp} 
        username={post.author.username}
        onUsernameClick={handleProfileClick}
        content={post.content}
        imageUrl={post.image_url}
        likes={post.likes}
        date={post.datetime.slice(0, 10).replace(/-/g, '/')}
        time={post.datetime.slice(11, 16)}
        />
      ))}
      <div className="flex justify-center w-full py-4">
        {paginationHasPrevious && (
          <button onClick={() => handlePaginationChange('backwards')} className="text-[#1DA1F2] hover:text-[#1d8ff2]">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
              <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
            </svg>
          </button>
        )}
        {paginationHasNext && (
          <button onClick={() => handlePaginationChange('forward')} className="text-[#1DA1F2] hover:text-[#1d8ff2]">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
              <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
            </svg>
          </button>
        )}
      </div>
    </>
  );
}


function UserProfileHeader({ username, pfp, banner, currentUser, userOwnsProfile }) {
  const [following, setFollowing] = React.useState(false);
  const [userData, setUserData] = React.useState({followerCount: null, followingCount: null});

   React.useEffect(() => {
    // ts name variables 💔
    // checks wether or not the current active user follows the user who owns this profile
    fetch(`is_following/${currentUser}/${username}`)
    .then(response => response.json())
    .then(isFollowing => {
      // console.log(isFollowing)
      setFollowing(isFollowing.isFollowing);
    });

    // gets data about the user who owns this profile
    fetch(`get_user_data/${username}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setUserData({
        followerCount: data.user.follower_count,
        followingCount: data.user.following_count
      });
    })
  }, [following]);

  function handleFollow() {
    if (following) {
      fetch(`unfollow/${username}/${currentUser}`)
      .then(response => response.json)
      .then(success => {
        if (success) {
          setFollowing(false);
        }
      });
    } else {
      fetch(`follow/${username}/${currentUser}`)
      .then(response => response.json)
      .then(success => {
        if (success) {
          setFollowing(true);
        }
      });
    }
  }

  
  // a lot of new css stuff here so pay atention 0-0
  return (
    <>
      {/* the class "relative" sets the positioning context for any ABSOLUTELY positioned child elements of this div 
      this allows the profile picture to be positioned relative to this container*/}
      <div className="border-b-2 border-[#424549] flex flex-col relative">
        {/* object cover makes sure that the image completetly fills its container, 
        preserving its aspect ratio by cropping the image instead of stretching it */}
        <img src={banner} className="w-full h-60 object-cover border-b-2 border-[#424549]" />

        {/* "absolute" positions the image absolutely inside the nearest "relative" element as we have seen.
        "bottom-[58px]" pushes the image 58px from the bottom of the parent container. 
        "left-6" positions the image 24px from the left of the parent container.
        "z-10" places trhe image above elements with a lower z-index, placing the pfp above the banner*/}
        <img src={pfp} className="absolute w-32 h-32 rounded-full border-4 border-[#424549] bottom-[58px] left-6 z-10" alt="pfp" />

        <div className="mt-16 px-6 mb-2 flex items-center">
          <div className="w-1/3">
            <h1 className="text-white text-xl font-bold">{username}</h1>
            <p className="text-gray-400">{userData.followerCount} followers - {userData.followingCount} following</p>
          </div>
          <div className="flex w-2/3 justify-end">
            {/*0-0: condition ? expressionIfTrue : expressionIfFalse 
            I thik I used this earlier idk, peep https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator*/}
            {!userOwnsProfile ? (
              following ? (
                <button onClick={handleFollow} className="py-2 px-6 rounded-3xl bg-[#424549] hover:bg-[#F24B59]">Unfollow</button>
              ) : (
                <button onClick={handleFollow} className="py-2 px-6 rounded-3xl bg-[#1DA1F2] hover:bg-[#1d8ff2]">Follow</button>
              )
            ) : null} {/* show nothing if user does infact own the profile */}
          </div>
        </div>
      </div>
    </>
  );
}



ReactDOM.render(<App />, document.querySelector('#app'));