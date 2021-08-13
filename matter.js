/*
 * Configure Matter with this kind of object
 *
 * @var conf = {
 *      target          : string @default '#matter'
 *      linksSelector   : string @default 'a[data-matter]'
 * }
 *
 */
export default class Matter {

    /* @type {{linksSelector: string, target: string}} */
    conf = {
        target: '#matter',
        linksSelector: 'a[data-matter]',
    }
    /* @type {HTMLHtmlElement} */
    html;
    /* @type {HTMLElement} */
    target;
    links = [];
    history = [];
    isLoaded = false;

    constructor (conf) {
        this.conf = typeof conf == 'object' ? {...this.conf, ...conf} : this.conf
        this.html = document.querySelector('html')
        this.target = document.querySelector(this.conf.target)
        this.getLinks().bindLinksClick()
        this.onPop()
        this.history = []
        this.history.push(window.location.href)
    }

    /**
     * Retrieve all links in DOM
     *
     * @returns
     */
    getLinks() {
        this.links = Array.from(document.querySelectorAll(this.conf.linksSelector)).filter((a, i, tab) => tab.indexOf(a) === i)
        return this
    }

    /**
     * Prevent pop statement
     */
    onPop() {
        window.onpopstate = (e) => {
            e.preventDefault()
            if (this.history.length > 1) {
                this.isLoaded = false
                this.fetchNextContent(this.history[this.history.length - 1], false)
                this.history = this.history.filter((href, i) => i !== this.history.length - 1);
            }
        }
    }

    /**
     * Listen on click event for all links selected and bind fetcher func
     */
    bindLinksClick() {
        this.links.forEach((link) => {
            link.removeEventListener('click', this.linkAction, true)
            link.addEventListener('click', (e) => this.linkAction(e))
        })
    }

    /**
     * Link's click event callback
     * @param event {Event}
     */
    linkAction (event) {
        event.preventDefault();
        if (event.target.href === window.location.href) {
            return
        }
        this.isLoaded = false
        this.fetchNextContent(event.target.href)
    }

    /**
     * Fetch next URL and create HTML element for conf.target.
     * Apply a transition on html and replace innerHTML of target by result
     * In error case : return default way
     *
     * @param {string} href URL to
     * @param {boolean} historyPushed Push last link in history. Used as false for window popstate event
     * @returns
     */
    fetchNextContent(href, historyPushed = true) {
        if (href === '' || !href) {
            throw new Error("Can't fetch an empty href");
        }
        const lastHref = window.location.href
        fetch(href)
            .then(r => r.text())
            .then(html => {
                if (!this.isLoaded) {
                    const node = new DOMParser().parseFromString(html, 'text/html');
                    document.title = node.head.querySelector('title').innerText
                    this.html.classList.add('matter-leave')
                    setTimeout(() => {
                        // Create new content
                        const nextContent = document.createElement('body');

                        // Set the new content
                        nextContent.innerHTML = node.body.innerHTML
                        try {
                            this.target.innerHTML = nextContent.querySelector(this.conf.target).innerHTML
                        } catch (e) {
                            location.replace(href);
                            throw new Error(e)
                        }

                        // Save in history
                        window.history.pushState({to: href, from: lastHref}, document.title, href);
                        if (historyPushed) {
                            this.history.push(lastHref)
                        }

                        // Apply transition
                        this.html.classList.add('matter-in')
                        this.html.classList.remove('matter-leave')
                        setTimeout(() => {
                            this.html.classList.remove('matter-in')
                                this.getLinks().bindLinksClick()
                                this.isLoaded = true
                        }, 500)
                    }, 200)
                }
            })
            .catch(e => {
                console.error(e)
                window.location.href = href
            })

        return this
    }
}
