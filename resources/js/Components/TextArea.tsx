import {
    forwardRef,
    TextareaHTMLAttributes,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextArea(
    props: TextareaHTMLAttributes<HTMLTextAreaElement>,
    ref,
) {
    const localRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    return (
        <textarea
            {...props}
            ref={localRef}
            className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                props.className || ''
            }`}
        />
    );
});
