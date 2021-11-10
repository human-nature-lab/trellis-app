# Templates
The underlying framework for Trellis is [Vue][0]. Trellis questions have full access to the [Vue template language][1] so that any HTML can be used to display a question.

## Using form data in a template
To use a custom template in a Trellis question simply start the question text with an HTML element like `<span>`, `<div>` or `<p>`. Data can be accessed via the `vars` or `data` variables. Here's a simple example that displays the response for a question called "best_pet" in the question text:

```vue-template
<span>The best pet is, "{{vars.best_pet}}"</span>
```

## More examples
TODO
### Add a link

### Add a Youtube video (requires internet access)

### Show respondent photos in a follow up section

[0]: https://vuejs.org
[1]: https://vuejs.org/v2/guide/syntax.html