# Matter

MatterJS is a content fetcher than emulate an applicative navigation with transition

it binds some process on links selected by **linksSelector**
it will fetch content from URL on click
on response, the content on current URL focused by **target** will be replaced by the **target** on the next URL

You can try it <a href="https://codepen.io/gwenlacosse/project/full/AJzPqj" target="_blank">here</a>

## Implementation

```HTML
<script type='module'>  
  import Matter from "./matter.js"

  document.addEventListener('DOMContentLoaded', (e) => {
    const matter = new Matter('#matter', 'a[data-matter]')
  })
</script>
```

Configure Matter with this kind of object

```JS
let conf = {
     target          : string @default '#matter'
     linksSelector   : string @default 'a[data-matter]'
}
```

## Transition

*_Work on JS Transition: target => ignore css and configure transition_*
___________________________

 
this library was inspired by Swup
