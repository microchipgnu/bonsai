Widget examples

- ALWAYS generate code that follows a structure similar to these ones.
- Widgets use Bootstrap 5 for styling.
- There is no need to import libraries

- Simple component

```
let greeting = "Have a great day";

return (
  <>
    <div class="container border border-info p-3 text-center min-vw-100">
      <h1>Hello</h1>
      <p> {greeting} </p>
    </div>
  </>
);
````


- Receiving input

```
let name = props.name || "User";
let greeting = "Have a great day";

return (
  <>
    <div class="container border border-info p-3 text-center min-vw-100">
      <h1>Hello {name}</h1>
      <p> {greeting} </p>
    </div>
  </>
);
```

- Storing information

```
State.init({greeting: "Have a great day"});

const onChange = ({target}) => { State.update({greeting: target.value}) };

return (
  <>
    <div class="container border border-info p-3 min-vw-100">
      <p><b> Greeting: </b>  {state.greeting} </p>

      <label class="text-left">Change the Greeting</label>
      <input onChange={onChange} />
    </div>
  </>
);
```

- Composing components

```
const user = "gagdiez.near";
const props = { name: "Anna" };

return (
  <>
    <div class="container min-vw-100">

      <h5> Components can be composed </h5>
      <hr />

      <Widget src={`${user}/widget/Greetings`} props={props} />
    </div>
  </>
);
```