export function click_decorator(ob: Object, name: string, desc: PropertyDescriptor) {
    let oryg = desc.value;

    desc.value = function (...args: any[]) {
        if (this.selected) {
            let audio: HTMLAudioElement = document.getElementsByTagName("audio")[0]
            audio.play()
        }
        return oryg.apply(this, args);
    }

}

export function points_decorator(ob: Object, name: string, desc: PropertyDescriptor) {
    let oryg = desc.value;

    desc.value = function (...args: any[]) {

        setTimeout(() => {
            synthVoice.speechElement.text = this.points
            synthVoice.synth.speak(synthVoice.speechElement)
        }, 200);

        return oryg.apply(this, args);
    }

}
let synthVoice = {
    speechElement: new SpeechSynthesisUtterance,
    synth: window.speechSynthesis,
    voices: [] as SpeechSynthesisVoice[],
    populteVoiceList: function () {
        synthVoice.voices = synthVoice.synth.getVoices();
        console.log(synthVoice.voices);
        if (synthVoice.voices.length != 0) {
            for (let i = 0; i < synthVoice.voices.length; i++) {
                if (synthVoice.voices[i].lang == "en-US") {
                    synthVoice.speechElement.voice = synthVoice.voices[i]
                }
            }
        }
    },
}
synthVoice.populteVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = synthVoice.populteVoiceList;
}