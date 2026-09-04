{{- define "mirror-front.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "mirror-front.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := include "mirror-front.name" . -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "mirror-front.configName" -}}
{{- printf "%s-config" (include "mirror-front.fullname" . | trunc 56 | trimSuffix "-") -}}
{{- end -}}

{{- define "mirror-front.exporterName" -}}
{{- printf "%s-statistics-exporter" (include "mirror-front.fullname" . | trunc 42 | trimSuffix "-") -}}
{{- end -}}

{{- define "mirror-front.exporterSelectorLabels" -}}
app.kubernetes.io/name: {{ include "mirror-front.exporterName" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "mirror-front.exporterLabels" -}}
{{- $labels := dict
  "app.kubernetes.io/name" (include "mirror-front.exporterName" .)
  "app.kubernetes.io/instance" .Release.Name
  "app.kubernetes.io/component" "statistics-exporter"
  "app.kubernetes.io/managed-by" .Release.Service
  "app.kubernetes.io/version" (.Values.statistics.image.tag | default .Values.image.tag | default .Chart.AppVersion | trunc 63 | trimSuffix "-")
  "helm.sh/chart" (printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-")
-}}
{{- toYaml $labels -}}
{{- end -}}

{{- define "mirror-front.selectorLabels" -}}
{{- if .Values.selectorLabels -}}
{{- toYaml .Values.selectorLabels -}}
{{- else -}}
app.kubernetes.io/name: {{ include "mirror-front.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
{{- end -}}

{{- define "mirror-front.labels" -}}
{{- $labels := dict
  "app.kubernetes.io/name" (include "mirror-front.name" .)
  "app.kubernetes.io/instance" .Release.Name
  "app.kubernetes.io/component" "frontend"
  "app.kubernetes.io/managed-by" .Release.Service
  "app.kubernetes.io/version" (.Values.image.tag | default .Chart.AppVersion | trunc 63 | trimSuffix "-")
  "helm.sh/chart" (printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-")
-}}
{{- mergeOverwrite $labels (include "mirror-front.selectorLabels" . | fromYaml) | toYaml -}}
{{- end -}}

{{- define "mirror-front.image" -}}
{{- if .image.digest -}}
{{- printf "%s@%s" .image.repository .image.digest -}}
{{- else -}}
{{- printf "%s:%s" .image.repository (.image.tag | default .defaultTag) -}}
{{- end -}}
{{- end -}}
