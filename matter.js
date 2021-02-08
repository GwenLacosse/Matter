/**
 * MatterJS is a content fetcher than emulate an applicative navigation with transition
 * 
 * it binds some process on links selected by @linksSelector
 * it will fetch content from URL on click
 * on response, the content on current URL focused by @target will be replaced by the @target on the next URL
 * 
 * For creating transition, Matter uses some CSS classes
 * 
 * .matter-transition {
 *      transition: .2s ease-out;
 *      transform: translate3d(0,0,0);
 *      opacity: 1;
 * } 
 * 
 * Matter add on html tag a class to create transition
 * 
 * html.matter-in .matter-transition {
 *      transform: translate3d(0, -40px, 0);
 *      opacity: 0;
 *      transition: 0 !important;
 * }
 * 
 * html.matter-leave .matter-transition {
 *      transform: translate3d(0, 40px, 0);
 *      opacity: 0;
 *      transition: 0 !important; 
 * }
 * 
 * You are free to override these classes ;)
 * 
 * ___________________________
 * 
 *  
 * this library was inspired by Swup or HighwayJS 
 * 
 * 
 * Configure Matter with this kind of object
 * 
 * @var conf = {
 *      target          : string @default '#matter'
 *      linksSelector   : string @default 'a[data-matter]'
 * }
 * 
 */
export default class Matter {

    conf = {
        target: '#matter',
        linksSelector: 'a[data-matter]',
    }
    links = []
    history = []
    html = null
    target = null

    constructor (conf) {
        this.conf = typeof conf == 'object' ? {...this.conf, ...conf} : this.conf
        this.html = document.querySelector('html')
        this.target = document.querySelector(this.conf.target)
        this.getLinks().bindLinksClick()
        this.onPop()
        this.history.push(window.location.href)
    }

    /**
     * Retrieve all links in DOM 
     * 
     * @returns
     */
    getLinks() {
        this.links = Array.from(document.querySelectorAll(this.conf.linksSelector))
        return this
    }

    /**
     * Prevent pop statement
     */
    onPop() {
        window.onpopstate = (e) => {
            e.preventDefault()
            if (this.history.length > 1) {
                this.fetchNextContent(this.history[this.history.length - 1], false)
                this.history = this.history.filter((href, i) => i != this.history.length - 1);
            }
        }
    }


    /**
     * Listen on click event for all links selected and bind fetcher func
     */
    bindLinksClick() {
        this.links.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.target.href == window.location.href) {
                    return
                }
                this.fetchNextContent(e.target.href)
            })
        })
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
        if (href == '' || !href) {
            throw new Error("Can't fetch an empty href");
        }

        this.html.classList.add('matter-leave')
        const lastHref = window.location.href

        fetch(href)
        .then(r => r.text())
        .then(html => {
            const node = new DOMParser().parseFromString(html, 'text/html');
            document.title = node.head.querySelector('title').innerText
    
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
                setTimeout(() => this.html.classList.remove('matter-in'), 100)
            }, 200)
    
        })
        .catch(e => {
            console.error(e)
            window.location.href = href
        })
    
        return this
    }

}
