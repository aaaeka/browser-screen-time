import { browser } from 'webextension-polyfill-ts'
import { PlayingMedia } from './types'

function createEvents(): void {
    let videoElems = document.querySelectorAll('video:not(.bws-dontSelect)');
    videoElems.forEach(elem => {
        elem.classList.add('bws-dontSelect');
        let video: PlayingMedia = {
            videoSource: elem.getAttribute('src'),
            url: location.hostname,
            state: null
        }
        elem.addEventListener('play', () => {
            video.state = 'playing';
            browser.runtime.sendMessage(video);
        });
        elem.addEventListener('pause', () => {
            video.state = 'paused';
            browser.runtime.sendMessage(video);
        });
        window.addEventListener('unload', () => {
            video.state = 'paused';
            browser.runtime.sendMessage(video);
        });
    })
}

const observer = new MutationObserver(createEvents);
observer.observe(document.body, {
    subtree: true,
    childList: true
})