import React from "react";
import { Grid, Typography, Box, Link } from "@mui/material";
import Zjusct from "../../resource/icons/zjusct.svg";

export default () => (
  <Box sx={{ px: 8, py: 6 }}>
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
                浙江大学开源软件镜像站是一个以普及开源软件，方便校内外用户高效访问开源项目的各种资源的非盈利计划。
              </Typography>
              <Typography variant="body2" color="text.secondary">
                本镜像站提供了包括 Docker, PostgreSQL, Ubuntu
                等项目源的镜像，以服务于教育和科学研究为目的，提倡自由、平等、协作、共享的精神。
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
                <Typography gutterBottom variant="body1" color="text.secondary" fontWeight={700}>
                  关于我们
                </Typography>
                <Typography gutterBottom variant="body2">
                  <Link
                    href="mailto:mail@zjusct.io"
                    color="text.secondary"
                    underline="hover"
                  >
                    Email
                  </Link>
                </Typography>
                <Typography gutterBottom variant="body2">
                  <Link
                    href="https://github.com/zjusct"
                    color="text.secondary"
                    underline="hover"
                  >
                    GitHub
                  </Link>
                </Typography>
                <Typography gutterBottom variant="body2">
                  <Link
                    href="https://www.zjusct.io"
                    color="text.secondary"
                    underline="hover"
                  >
                    Blog
                  </Link>
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom variant="body1" color="text.secondary" fontWeight={700}>
                  特别鸣谢
                </Typography>
                <Typography gutterBottom variant="body2">
                  <Link
                    href="http://zuits.zju.edu.cn"
                    color="text.secondary"
                    underline="hover"
                  >
                    浙江大学信息技术中心
                  </Link>
                </Typography>
                <Typography gutterBottom variant="body2">
                  <Link
                    href="https://tuna.moe"
                    color="text.secondary"
                    underline="hover"
                  >
                    清华大学 TUNA 协会
                  </Link>
                </Typography>
                <Typography gutterBottom variant="body2">
                  <Link
                    href="https://lug.ustc.edu.cn"
                    color="text.secondary"
                    underline="hover"
                  >
                    中国科学技术大学 Linux 用户协会
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item marginTop={2}>
        <Zjusct width="10rem" height="3rem" />
      </Grid>
    </Grid>
  </Box>
);
