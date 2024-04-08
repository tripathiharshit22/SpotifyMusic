let currentSong = new Audio();
let songs;
let currFolder;

//function for timer 00:00
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/Project-file5/${folder}/`);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    //show all the song in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
        <img src="img/music-logo.svg" alt="">
        <div class="songInfo">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Harshit</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <i class="fa-solid fa-circle-play"></i>
        </div>
        </li>`
    }


    //attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML.trim())
        })
    })

    return songs;


}

const playMusic = (track, pause = false) => {
    currentSong.src = `/Project-file5/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"

    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"


}

async function displayAlbums() {
    let a = await fetch(`/Project-file5/songs/`);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")

    let array = Array.from(anchors)


    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];
            console.log(folder)
            //get the metadata of the folder
            let a = await fetch(`/Project-file5/songs/${folder}/info.json`)
            let response = await a.json();

            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder=${folder}  class="card ">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60">
                        <!-- Green Circular Background -->
                        <circle cx="12" cy="12" r="11" fill="#1FDF64" />

                        <!-- Black Play Icon (scaled down and centered) -->
                        <path d="M9 18v-12l8.5 6z" fill="#000000" transform="scale(0.75) translate(4, 4)" />
                    </svg>
                </div>
                <img src="/Project-file5/songs/${folder}/cover.jpeg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`

        }


    }
    //load playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])  //plays the first song automatically when playlist is clicked
        })



    })

}

async function main() {
    //List of all the songs
    await getSongs("songs/diljitdosanjhmix")
    playMusic(songs[0], true) //for automatically load first song default


    //display all the albums on the page
    displayAlbums();


    //attach an event listner to previous, play , next 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"

        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"  //for automatically moving circle on seekbar
    })

    //add an event listner to seek on seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percentSeek = (e.offsetX / e.target.getBoundingClientRect().width) * 100;  //getBoundingClientRect() is for x,y location of click on page used here
        document.querySelector(".circle").style.left = percentSeek + "%";
        currentSong.currentTime = ((currentSong.duration) * percentSeek) / 100

    })

    //add an eventlistener to hammburger
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
    })
    //add an eventlistener to close button
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%"
    })



    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })



    //add an eventlistner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
        

    })


    //add an eventlistner to mute the volume
    document.querySelector(".volume>img").addEventListener("click", e => {

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })



}
main()

