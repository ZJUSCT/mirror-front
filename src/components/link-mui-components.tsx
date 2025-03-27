import React, { PropsWithoutRef } from 'react';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import { navigate } from 'gatsby';
import { ButtonBaseProps } from '@mui/material';

interface LinkProps {
  to?: string;
  href?: string;
}

type LinkComponentProps<T> = ButtonBaseProps & LinkProps & T;

function linkifyComponent<T, PropType>(
  ButtonBaseComponent: React.ComponentType<ButtonBaseProps & PropType>
) {
  const f: React.ForwardRefRenderFunction<
    T,
    PropsWithoutRef<LinkComponentProps<PropType>>
  > = (props, ref) => {
    const propOnClick = props.onClick;
    const clickHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
      if (propOnClick) propOnClick(event);
      if (props.to) navigate(props.to);
    };
    return (
      <ButtonBaseComponent
        {...(props as LinkComponentProps<PropType>)}
        onClick={clickHandler}
        ref={ref}
      >
        {props.children}
      </ButtonBaseComponent>
    );
  };
  return React.forwardRef(f);
}

const LinkButton = linkifyComponent(Button);
const LinkCardActionArea = linkifyComponent(CardActionArea);
const LinkIconButton = linkifyComponent(IconButton);
const LinkLink = linkifyComponent(Link);

export { LinkProps, LinkButton, LinkCardActionArea, LinkIconButton, LinkLink };
