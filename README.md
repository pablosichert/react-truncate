# React-Truncate
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Coverage status][coveralls-image]][coveralls-url]
[![Dependency status][david-dm-image]][david-dm-url]
[![Dev dependency status][david-dm-dev-image]][david-dm-dev-url]

## Install
```
$ npm install react-truncate
```

## Usage
```js
import Truncate from 'react-truncate';

// ...

class Foo extends Component {
    render() {
        return (
            <Truncate lines={3} ellipsis={<span>... <a href='/link/to/article'>Read more</a></span>}>
                {longText}
            </Truncate>
        );
    }
}
```

Hint: (Generally with React) if you want to preserve newlines from plain text, you need to do as follows:
```js
//...
    {text.split('\n').map((line, i, arr) => {
        const line = <span key={i}>{line}</span>;

        if (i === arr.length - 1) {
            return line;
        } else {
            return [line, <br key={i + 'br'} />];
        }
    })}
//...
```

## API
| Prop | Type | Default | Description | Example |
| ---- | ---- | ------- | ----------- | ------- |
| lines | integer, boolean {false} | `1` | Specifies how many lines of text should be preserved until it gets truncated. `false` and any integer < 1 will result in the text not getting clipped at all. | (`false`, `-1`, `0`), `1`, ...  |
| ellipsis | string, React node | `'…'` | An ellipsis that is added to the end of the text in case it is truncated. | `'...'`, `<span>...</span>`, `<span>... <a href='#' onClick={someHandler}>Read more</a></span>`, `[<span key='some'>Some</span>, <span key='siblings'>siblings<span>]`
| children | string, React node | | The text to be truncated. Anything that can be evaluated as text. | `'Some text'`, `<p>Some paragraph <a/>with other text-based inline elements<a></p>`, `<span>Some</span><span>siblings</span>` |
| trimWhitespace | boolean | `false` | If `true`, whitespace will be removed from before the ellipsis (e.g. `words ...` will become `words...` instead) | `<Truncate trimWhitespace>{longText}</Truncate>` |
| width | number | `0` | If not `0`, the calculation of the content will be based on this number. | `<Truncate trimWhitespace>{longText}</Truncate>` |
| onTruncate | function | | Gets invoked on each render. Gets called with `true` when text got truncated and ellipsis was injected, and with `false` otherwise. | `isTruncated => isTruncated !== this.state.isTruncated && this.setState({ isTruncated })` |

## Known issues
- Resize content when the **size** of **parent container changed** (use the `width` property or call `ref.onResize()`). See [issue](https://github.com/One-com/react-truncate/issues/49)
- Text exceeding horizontal boundaries when "viewport" meta tag is not set accordingly for **mobile** devices (font boosting leads to **wrong calculations**). See [issue](https://github.com/One-com/react-truncate/issues/4#issuecomment-226703499)
- Output in plain text only - no support for **markup/HTML**. See [issue](https://github.com/One-com/react-truncate/issues/8)
- Wrong line breaks when **custom font** is loading after the component has rendered. See [issue](https://github.com/One-com/react-truncate/issues/16)
- No support for **letter spacing** / **word spacing**. See [issue](https://github.com/One-com/react-truncate/issues/59)

## Integrated example for toggling "read more" text
```js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';

class ReadMore extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            expanded: false,
            truncated: false
        };

        this.handleTruncate = this.handleTruncate.bind(this);
        this.toggleLines = this.toggleLines.bind(this);
    }

    handleTruncate(truncated) {
        if (this.state.truncated !== truncated) {
            this.setState({
                truncated
            });
        }
    }

    toggleLines(event) {
        event.preventDefault();

        this.setState({
            expanded: !this.state.expanded
        });
    }

    render() {
        const {
            children,
            more,
            less,
            lines
        } = this.props;

        const {
            expanded,
            truncated
        } = this.state;

        return (
            <div>
                <Truncate
                    lines={!expanded && lines}
                    ellipsis={(
                        <span>... <a href='#' onClick={this.toggleLines}>{more}</a></span>
                    )}
                    onTruncate={this.handleTruncate}
                >
                    {children}
                </Truncate>
                {!truncated && expanded && (
                    <span> <a href='#' onClick={this.toggleLines}>{less}</a></span>
                )}
            </div>
        );
    }
}

ReadMore.defaultProps = {
    lines: 3,
    more: 'Read more',
    less: 'Show less'
};

ReadMore.propTypes = {
    children: PropTypes.node.isRequired,
    lines: PropTypes.number,
    less: PropTypes.string,
    more: PropTypes.string
};

export default ReadMore;
```

## Developing
Install system libraries needed for development dependencies
- https://github.com/Automattic/node-canvas#installation

Install development dependencies
```
$ npm install
```

Run tests
```
$ npm test
```

Run code linter
```
$ npm run lint
```

Compile to ES5 from /src to /lib
```
$ npm run compile
```

[npm-url]:https://npmjs.org/package/react-truncate
[downloads-image]:http://img.shields.io/npm/dm/react-truncate.svg
[npm-image]:https://badge.fury.io/js/react-truncate.svg
[travis-url]:https://travis-ci.org/One-com/react-truncate
[travis-image]:https://travis-ci.org/One-com/react-truncate.svg?branch=master
[coveralls-url]:https://coveralls.io/r/One-com/react-truncate
[coveralls-image]:https://coveralls.io/repos/One-com/react-truncate/badge.svg
[david-dm-url]:https://david-dm.org/One-com/react-truncate
[david-dm-image]:https://david-dm.org/One-com/react-truncate.svg
[david-dm-dev-url]:https://david-dm.org/One-com/react-truncate#info=devDependencies
[david-dm-dev-image]:https://david-dm.org/One-com/react-truncate/dev-status.svg
