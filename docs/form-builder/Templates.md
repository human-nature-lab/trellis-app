# Templates
The underlying frameworks for Trellis are [Vue][0] and [Vuetify][2]. Trellis questions have full access to the [Vue template language][1] so that any HTML or Vuetify components can be used to display a question.

## Using form data in a template
To use a custom template in a Trellis question simply start the question text with an HTML element like `<span>`, `<div>` or `<p>`. Data can be accessed via the `vars` or `data` variables. Here's a simple example that displays the response for a question called "best_pet" in the question text:

```html
<span>The best pet is, "{{vars.best_pet}}"</span>
```

## More examples
### Add a link
```html
<p>
  <a href="https://example.com">A link to something</a>
</p>
```

### Embed a Youtube video (requires internet access for tablets)
```html
<iframe width="1318" height="750" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;" allowfullscreen></iframe>
```

### Show respondent photos in a follow up section
In this example we're assuming this question follows up to a relationship question called "friends" and because we're using asynchronous data, we've added a loading progress bar.
```html
<v-col>
  <v-row class="text-h3">
    Your friends
  </v-row>
  <v-row v-if="vars.friends" v-for="edge in vars.friends">
    <v-col>
      <v-row class="justify-space-around">
        <h4 class="text-h4 text-center">
          {{edge.targetRespondent.name}}
        </h4>
      </v-row>
      <v-row v-if="edge.targetRespondent.photos.length">
        <Photo
          height="300"
          is-centered 
          :photo="edge.targetRespondent.photos[0]" />
      </v-row>
    </v-col>
  </v-row>
  <v-progress-linear v-else indeterminate />
</v-col>
```

[0]: https://vuejs.org
[1]: https://vuejs.org/v2/guide/syntax.html
[2]: https://vuetifyjs.com