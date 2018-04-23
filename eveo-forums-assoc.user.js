// ==UserScript==
// @name         EVE Online Forums Character association
// @namespace    https://github.com/Robbilie/tampermonkey-scripts/
// @version      1.0.9
// @description  add character association to user popups
// @author       robbilie@tweetfleet (Robert Schuh)
// @match        https://forums.eveonline.com/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Robbilie/tampermonkey-scripts/master/eveo-forums-assoc.user.js
// @updateURL    https://raw.githubusercontent.com/Robbilie/tampermonkey-scripts/master/eveo-forums-assoc.user.js
// ==/UserScript==

window.addEventListener("load", function () {
    'use strict';

    var card = document.getElementById("user-card");

    new MutationObserver(mutations => mutations.forEach(mutation => {
        if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].className === "card-content") {

            var namelist = card.querySelector(".names");
            var name = namelist.querySelector(".full-name").innerText.split("\n")[0].trim();

            var profile = document.createElement("a");
                profile.target = "_blank";
                profile.href = `//evewho.com/pilot/${escape(name)}`;
                profile.innerHTML = `<i class="fa fa-external-link" />`;
                profile.rel = "noreferrer";
                profile.title = `Character: ${name}`;
            namelist.querySelector(".full-name").appendChild(profile);

            getCharacterAssociation(name).then(res => res.forEach(entity => {
                var type = entity.member_count !== undefined ? "Corporation" : "Alliance";
                var type2 = entity.member_count !== undefined ? "corp" : "alli";
                var h = document.createElement("h2");
                    h.innerHTML = `<a title="${type}: ${entity.name}" rel="noreferrer" href="//evewho.com/${type2}/${escape(entity.name)}" target="_blank"><i>${entity.name}</i></a>`;
                namelist.appendChild(h);
            }));
        }
    })).observe(card, { childList: true });

    function getCharacterAssociation (name) {
        return fetch(`https://esi.tech.ccp.is/latest/search/?categories=character&search=${escape(name)}&strict=true`)
        .then(res => res.json())
        .then(res => res.character[0])
        .then(id => fetch(`https://esi.tech.ccp.is/latest/characters/${id}/`))
        .then(res => res.json())
        .then(res => {
            let requests = [];
            if (res.corporation_id !== undefined) {
                requests.push(fetch(`https://esi.tech.ccp.is/latest/corporations/${res.corporation_id}/`).then(res => res.json()));
            }
            if (res.alliance_id !== undefined) {
                requests.push(fetch(`https://esi.tech.ccp.is/latest/alliances/${res.alliance_id}/`).then(res => res.json()));
            }
            return Promise.all(requests);
        });
    }

});
