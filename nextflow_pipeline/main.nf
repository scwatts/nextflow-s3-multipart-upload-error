#!/usr/bin/env nextflow

process LIST {
  debug true

  input:
  path f

  script:
  """
  ls -lh ${f}
  """
}

workflow {

  base_url = 'https://pub-349bcb8decb44bf7acbddf90b270a061.r2.dev/HCC1395-SRA/25.0/data/wgts/fastq'

  ch_filenames = Channel.of(
    'HCC1395__normal_wgs__WGS_IL_N_1__SRR7890859__subsampled.1.fastq.gz',
    'HCC1395__normal_wgs__WGS_IL_N_1__SRR7890859__subsampled.2.fastq.gz',
  )

  ch_urls = ch_filenames.map { "${base_url}/${it}" }

  LIST(ch_urls)

}
