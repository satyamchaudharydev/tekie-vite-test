import React from 'react'
import Select from 'react-select'

const getSelectColorStyles = () => {
    return {
        indicatorSeparator: styles => ({ ...styles,
            display: 'none',
            padding: '0px'
        }),
        control: (styles, { isFocused }) => ({ ...styles, backgroundColor: 'white',
            borderColor: '#00ADE6',
            boxShadow: isFocused ? '0 0 0 2px rgba(0, 173, 229, 0.6)' : 'none',
            color: 'rgba(0, 0, 0, 0.6)',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'rgba(0, 0, 0, 0.6)',
        }),
        option: (styles, { isDisabled, isFocused, isSelected }) => {
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? null
                    : isSelected
                        ? 'rgba(0, 173, 229, 0.6)'
                        : isFocused
                            ? '#e7fbfd'
                            : '#ffffff',
                color: isDisabled
                    ? '#ccc'
                    : isSelected
                        ? 'white'
                        : 'rgba(0, 0, 0, 0.6)',
                cursor: isDisabled ? 'not-allowed' : 'default',
                '&:hover': {
                    backgroundColor: !isDisabled && '#e7fbfd',
                },
                ':active': {
                    ...styles[':active'],
                    backgroundColor: !isDisabled && (isSelected ? '#e7fbfd' : '#504f4f'),
                },
            };
        },
    };
}
    
const SelectDropDown = (props) => (
    <Select
        styles={getSelectColorStyles()}
        {...props}  
    />
)

export default React.memo(SelectDropDown)