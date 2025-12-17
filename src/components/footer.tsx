import { Box, Grid, Link, Typography, useTheme } from '@mui/material';
import { Trans } from 'gatsby-plugin-react-i18next';
import React from 'react';
import { ReactComponent as Zjusct } from '../../resource/icons/zjusct.svg';
import { ReactComponent as ZjusctDark } from '../../resource/icons/zjusct-dark.svg';
import { ReactComponent as Zju } from '../../resource/icons/zju.svg';
import { ReactComponent as ZjuDark } from '../../resource/icons/zju-dark.svg';

export default () => {
  const theme = useTheme();
  const ZjuIcon = theme.palette.mode === 'light' ? Zju : ZjuDark;
  const ZjusctIcon = theme.palette.mode === 'light' ? Zjusct : ZjusctDark;

  return (
    <Box sx={{ px: { xs: 4, sm: 8 }, py: 6, mt: 'auto' }}>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        rowSpacing={2}
      >
        <Grid>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            columns={2}
            rowSpacing={2}
            columnSpacing={8}
          >
            <Grid>
              <Box maxWidth={520}>
                <Typography gutterBottom variant="body2" color="text.secondary">
                  <Trans>
                    浙江大学开源软件镜像站是一个致力于普及开源软件，方便校内外用户高效访问开源项目的各种资源的非盈利计划。
                  </Trans>
                </Typography>
                <Typography gutterBottom variant="body2" color="text.secondary">
                  <Trans>
                    本镜像站提供了包括 Docker, PostgreSQL, Ubuntu
                    等项目源的镜像，以服务教育和科学研究为目的，提倡自由、平等、协作、共享的精神。
                  </Trans>
                </Typography>
                <Typography gutterBottom variant="body2" color="text.secondary">
                  <Link
                    href="https://github.com/ZJUSCT/mirror-issues"
                    color="text.secondary"
                    underline="hover"
                  >
                    <Trans>问题反馈与镜像请求（GitHub）</Trans>
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Trans>根据相关法律法规，本站不对欧盟用户提供服务。</Trans>
                </Typography>
              </Box>
            </Grid>
            <Grid>
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-end"
                columnSpacing={8}
              >
                <Grid>
                  <Typography
                    gutterBottom
                    variant="body1"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    <Trans>关于我们</Trans>
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    <Link
                      href="mailto:mirrors@zju.edu.cn"
                      color="text.secondary"
                      underline="hover"
                    >
                      <Trans>Email</Trans>
                    </Link>
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    <Link
                      href="https://github.com/zjusct"
                      color="text.secondary"
                      underline="hover"
                    >
                      <Trans>GitHub</Trans>
                    </Link>
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    <Link
                      href="https://www.zjusct.io"
                      color="text.secondary"
                      underline="hover"
                    >
                      <Trans>Blog</Trans>
                    </Link>
                  </Typography>
                </Grid>
                <Grid>
                  <Typography
                    gutterBottom
                    variant="body1"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    <Trans>特别鸣谢</Trans>
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    <Link
                      href="http://zuits.zju.edu.cn"
                      color="text.secondary"
                      underline="hover"
                    >
                      <Trans>浙江大学信息技术中心</Trans>
                    </Link>
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    <Link
                      href="https://tuna.moe"
                      color="text.secondary"
                      underline="hover"
                    >
                      <Trans>清华大学 TUNA 协会</Trans>
                    </Link>
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    <Link
                      href="https://mirrorz.org/"
                      color="text.secondary"
                      underline="hover"
                    >
                      <Trans>MirrorZ 镜像站项目</Trans>
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid>
          <Grid
            container
            direction="row"
            columnSpacing={4}
            rowSpacing={2}
            alignItems="center"
          >
            <Grid>
              <Link href="https://zuits.zju.edu.cn/">
                <ZjuIcon width="16rem" />
              </Link>
            </Grid>
            <Grid>
              <Link href="https://www.zjusct.io">
                <ZjusctIcon width="12rem" />
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
