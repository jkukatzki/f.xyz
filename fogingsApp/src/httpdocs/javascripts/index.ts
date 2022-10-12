import {experiences} from './index_three.js';

let logos = ['tag_logo.png','gothic_tag_logo.png', 'throwie_logo.png']
var logoIndex = Math.floor(Math.random()*(logos.length));
$('.logo').attr('src','images/'+logos[logoIndex]);
$(".logo").hover(hoverLogo, leaveLogo);
function hoverLogo(this: HTMLElement){
    logoIndex = (logoIndex + 1) % logos.length;
    $(this).attr('src','images/'+logos[logoIndex]);
}
function leaveLogo(){
}

$("#title-middle-video").hover( hoverVideo, leaveVideo );
function hoverVideo(this: HTMLElement){
    const el = $(this)[0];
    if(el instanceof HTMLVideoElement){
        el.play();
        if(experiences[0].objects.lights){
            experiences[0].objects.lights['center'].light.intensity = 0.6;
        }
    }
}

function leaveVideo(this: HTMLElement){
    const el = $(this)[0];
    if(el instanceof HTMLVideoElement){
        el.pause();
        if(experiences[0].objects.lights){
            experiences[0].objects.lights['center'].light.intensity = 0.3;
        }
    }
}