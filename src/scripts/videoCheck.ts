import { browser } from 'webextension-polyfill-ts'
import { PlayingMediaChangeEvent } from './types'

function createEvents(): void {
    let videoElems = document.querySelectorAll('video:not(.bws-dontSelect)');
    videoElems.forEach(elem => {
        elem.classList.add('bws-dontSelect');
        let video: PlayingMediaChangeEvent = {
            type: 'playingMedia',
            playingMedia: {
                videoSource: elem.getAttribute('src'),
                url: location.hostname,
                state: null
            }
        }
        elem.addEventListener('play', () => {
            video.playingMedia.state = 'playing';
            browser.runtime.sendMessage(video);
        });
        elem.addEventListener('pause', () => {
            video.playingMedia.state = 'paused';
            browser.runtime.sendMessage(video);
        });
        elem.addEventListener('emptied', () => {
            video.playingMedia.state = 'paused';
            browser.runtime.sendMessage(video);
        });
        window.addEventListener('unload', () => {
            video.playingMedia.state = 'paused';
            browser.runtime.sendMessage(video);
        });
    })
}

const observer = new MutationObserver(createEvents);
observer.observe(document.body, {
    subtree: true,
    childList: true
});