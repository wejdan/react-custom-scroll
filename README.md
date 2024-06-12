# CustomScroll Component

## Description

The `CustomScroll` component provides a customizable scrollbar for your content, enhancing the user experience by offering a smoother and more visually appealing alternative to the default browser scrollbar. It includes features such as a draggable thumb, smooth scrolling, and continuous scrolling when holding down the scroll buttons.

## Features

- Customizable scrollbar thumb and track.
- Smooth scrolling animations.
- Continuous scrolling by holding the scroll buttons.
- Adjustable scrollbar thumb size based on content height.
- Prevents thumb from overlapping with scroll buttons.

## Installation

### Prerequisites

Make sure you have `styled-components` installed in your project. If not, you can install it using:

```sh
npm install styled-components
```

### Adding the Component

1. **Create the Component File**

   Create a file named `CustomScroll.js` and add the `CustomScroll` component code to it.

2. **Import and Use the Component**

   Import the `CustomScroll` component in your desired file and use it to wrap your scrollable content.

   ```jsx
   import React, { useRef } from 'react';
   import CustomScroll from './CustomScroll';

   const MyComponent = () => {
     const listInnerRef = useRef(null);

     const handleScroll = () => {
       // Handle scroll event
     };

     return (
       <CustomScroll
         ref={listInnerRef}
         onScroll={handleScroll}
         style={{ height: "100%", position: "relative", padding: "12px" }}
       >
         <div>Your scrollable content here...</div>
       </CustomScroll>
     );
   };

   export default MyComponent;
   ```

## Usage

### Props

- **children**: The scrollable content to be displayed inside the `CustomScroll` component.
- **onScroll**: A callback function that is triggered when the scroll event occurs.
- **style**: Inline styles for the outer container of the `CustomScroll` component.
- **contentStyle**: Inline styles for the inner scrollable content container.

### Methods

You can access various scroll methods by using `ref` with the `CustomScroll` component:

- **scrollToTop**: Scroll to the top of the content.
- **scrollToBottom**: Scroll to the bottom of the content.
- **scrollTo(position)**: Scroll to a specific position.
- **smoothScroll(position)**: Smoothly scroll to a specific position.
- **getScrollProps**: Get the current scroll properties, including `scrollHeight`, `scrollTop`, and `clientHeight`.

### Example

```jsx
import React, { useRef } from 'react';
import CustomScroll from './CustomScroll';

const MyComponent = () => {
  const listInnerRef = useRef(null);

  const handleScroll = () => {
    // Handle scroll event
  };

  return (
    <CustomScroll
      ref={listInnerRef}
      onScroll={handleScroll}
      style={{ height: "100%", position: "relative", padding: "12px" }}
    >
      <div>Your scrollable content here...</div>
    </CustomScroll>
  );
};

export default MyComponent;
```

## Customization

You can customize the appearance of the scrollbar by modifying the `styled-components` styles defined in the `CustomScroll` component. This includes changing the colors, sizes, and other properties of the thumb, track, and buttons.

## License

This component is open-source and available under the MIT License. Feel free to use, modify, and distribute it as per the license terms.
