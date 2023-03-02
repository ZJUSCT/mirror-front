import { Box, Grid, Link, Typography } from '@mui/material';
import { Trans } from 'gatsby-plugin-react-i18next';
import React from 'react';
import Zjusct from '../../resource/icons/zjusct.svg';

export default () => (
  <Box sx={{ px: { xs: 4, sm: 8 }, py: 6 }}>
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="flex-end"
    >
      <Grid item>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          columns={2}
          rowSpacing={2}
          columnSpacing={8}
        >
          <Grid item xs={2} md={1}>
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
          <Grid item xs={2} md={1}>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-end"
              columnSpacing={8}
            >
              <Grid item>
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
              <Grid item>
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
      <Grid item marginTop={2}>
        <Link href="https://www.zjusct.io">
          <Zjusct width="10rem" height="3rem" />
        </Link>
      </Grid>
    </Grid>
  </Box>
);
