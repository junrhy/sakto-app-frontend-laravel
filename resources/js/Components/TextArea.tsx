import { forwardRef, useEffect, useImperativeHandle, useRef, TextareaHTMLAttributes } from 'react';

export default forwardRef(function TextArea(
    props: TextareaHTMLAttributes<HTMLTextAreaElement>,
    ref
) {
    const localRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    return (
        <textarea
            {...props}
            ref={localRef}
            className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${
                props.className || ''
            }`}
        />
    );
}); 