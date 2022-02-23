import Icon from "@enact/agate/Icon"
import CheckboxItem from "@enact/agate/CheckboxItem"
import css from './UrlManager.module.less';
import { useCallback } from "react";

const URLListItem = ({ name, onSelect, onEdit }) => {
    const onToggleHandler = useCallback((value) => {
        onSelect({
            name,
            selected: value.selected
        });
    }, [onSelect, name])
    const onEditHandler = useCallback((value) => {
        onEdit({
            name,
            selected: value.selected
        });
    }, [onEdit, name])
    return (
        <div className={css.URLListItem}>
            <div className={css.checkBoxItem}><CheckboxItem onToggle={onToggleHandler}>{name}</CheckboxItem></div>
            <div className={css.editButton}><Icon onClick={onEditHandler}>edit</Icon></div>
        </div>
    )
}


export default URLListItem;