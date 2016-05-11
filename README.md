# React-Truncate
## Install
```
npm install react-truncate
```

## Usage
```js
import Truncate from 'react-truncate';

// ...

class Foo extends Component {
    render() {
        return (
            <Truncate lines={3} ellipsis={<span>... <a href='#'>Read more</a></span>}>
                {longText}
            </Truncate>
        );
    }
}
```
